import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('1. ID da troca recebido:', id);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('2. Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { status } = await request.json();
    console.log('3. Status recebido:', status);

    if (!status || !['ACEITA', 'RECUSADA'].includes(status)) {
      console.log('4. Status inválido:', status);
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // Buscar a troca com todas as informações necessárias
    const troca = await prisma.troca.findUnique({
      where: { id },
      include: {
        figurinhaOferta: {
          include: {
            jogador: {
              include: {
                time: true
              }
            }
          }
        },
        figurinhaSolicitada: {
          include: {
            jogador: {
              include: {
                time: true
              }
            }
          }
        }
      }
    });
    console.log('5. Troca encontrada:', troca?.id);

    if (!troca) {
      console.log('6. Troca não encontrada');
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    // Se a troca for aceita, realizar a troca das figurinhas
    if (status === 'ACEITA') {
      // Verificar se ambos os usuários ainda possuem as figurinhas
      const figurinhaOfertaUsuario = await prisma.userFigurinha.findFirst({
        where: {
          userId: troca.usuarioEnviaId,
          figurinhaId: troca.figurinhaOfertaId,
          quantidade: { gt: 0 }
        }
      });

      const figurinhaSolicitadaUsuario = await prisma.userFigurinha.findFirst({
        where: {
          userId: troca.usuarioRecebeId || '',
          figurinhaId: troca.figurinhaSolicitadaId || '',
          quantidade: { gt: 0 }
        }
      });

      if (!figurinhaOfertaUsuario || !figurinhaSolicitadaUsuario) {
        console.log('7. Um dos usuários não possui mais a figurinha');
        return NextResponse.json(
          { error: 'Um dos usuários não possui mais a figurinha para troca' },
          { status: 400 }
        );
      }

      // Verificar se temos todas as informações necessárias
      if (!troca.figurinhaOferta?.jogador?.nome || !troca.figurinhaOferta?.jogador?.time?.nome ||
          !troca.figurinhaSolicitada?.jogador?.nome || !troca.figurinhaSolicitada?.jogador?.time?.nome) {
        console.log('8. Informações do jogador ou time incompletas');
        return NextResponse.json(
          { error: 'Informações do jogador ou time incompletas' },
          { status: 400 }
        );
      }

      // Garantir que temos todas as informações necessárias
      const nomeJogadorOferta = troca.figurinhaOferta.jogador?.nome || '';
      const nomeTimeOferta = troca.figurinhaOferta.jogador?.time?.nome || '';
      const nomeJogadorSolicitada = troca.figurinhaSolicitada.jogador?.nome || '';
      const nomeTimeSolicitada = troca.figurinhaSolicitada.jogador?.time?.nome || '';

      // Realizar a troca das figurinhas em uma transação
      await prisma.$transaction(async (tx) => {
        // 1. Diminuir quantidade da figurinha ofertada do usuário X
        await tx.userFigurinha.update({
          where: {
            id: figurinhaOfertaUsuario.id
          },
          data: {
            quantidade: {
              decrement: 1
            }
          }
        });

        // 2. Aumentar quantidade da figurinha solicitada para o usuário X
        await tx.userFigurinha.upsert({
          where: {
            userId_figurinhaId: {
              userId: troca.usuarioEnviaId,
              figurinhaId: troca.figurinhaSolicitadaId || ''
            }
          },
          create: {
            userId: troca.usuarioEnviaId,
            figurinhaId: troca.figurinhaSolicitadaId || '',
            quantidade: 1,
            nomeJogador: nomeJogadorSolicitada,
            nomeTime: nomeTimeSolicitada
          },
          update: {
            quantidade: {
              increment: 1
            }
          }
        });

        // 3. Diminuir quantidade da figurinha solicitada do usuário Y
        await tx.userFigurinha.update({
          where: {
            id: figurinhaSolicitadaUsuario.id
          },
          data: {
            quantidade: {
              decrement: 1
            }
          }
        });

        // 4. Aumentar quantidade da figurinha ofertada para o usuário Y
        await tx.userFigurinha.upsert({
          where: {
            userId_figurinhaId: {
              userId: troca.usuarioRecebeId || '',
              figurinhaId: troca.figurinhaOfertaId
            }
          },
          create: {
            userId: troca.usuarioRecebeId || '',
            figurinhaId: troca.figurinhaOfertaId,
            quantidade: 1,
            nomeJogador: nomeJogadorOferta,
            nomeTime: nomeTimeOferta
          },
          update: {
            quantidade: {
              increment: 1
            }
          }
        });
      });
    }

    // Atualiza o status da troca
    const trocaAtualizada = await prisma.troca.update({
      where: { id },
      data: { 
        status,
        usuarioRecebeId: session.user.id
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        }
      }
    });
    console.log('8. Troca atualizada:', trocaAtualizada.id);

    // Cria uma notificação para o usuário que propôs a troca
    await prisma.notificacao.create({
      data: {
        tipo: status === 'ACEITA' ? 'TROCA_ACEITA' : 'TROCA_RECUSADA',
        mensagem: status === 'ACEITA'
          ? `${session.user.name} aceitou sua proposta de troca da figurinha ${troca.figurinhaOferta.jogador?.nome || 'desconhecido'}`
          : `${session.user.name} recusou sua proposta de troca da figurinha ${troca.figurinhaOferta.jogador?.nome || 'desconhecido'}`,
        usuarioId: troca.usuarioEnviaId,
        trocaId: troca.id
      }
    });
    console.log('9. Notificação criada');

    return NextResponse.json(trocaAtualizada);
  } catch (error) {
    console.error('Erro ao responder troca:', error);
    return NextResponse.json(
      { error: 'Erro ao responder troca' },
      { status: 500 }
    );
  }
} 