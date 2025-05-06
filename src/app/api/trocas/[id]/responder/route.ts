import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TrocaStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { aceitar } = await request.json();
    const { id: trocaId } = await context.params;

    // Buscar o usuário atual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar a troca
    const troca = await prisma.troca.findUnique({
      where: { id: trocaId },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        },
        figurinhaSolicitada: true
      }
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é o dono da oferta (quem pode aprovar/recusar)
    if (troca.usuarioEnviaId !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Verificar se a troca já foi respondida
    if (troca.status !== TrocaStatus.PENDENTE) {
      return NextResponse.json({ error: 'Troca já foi respondida' }, { status: 400 });
    }

    if (aceitar) {
      // Verificar se o usuário (dono da oferta) ainda tem a figurinha ofertada
      const figurinhaOferta = await prisma.userFigurinha.findFirst({
        where: {
          userId: user.id,
          figurinhaId: troca.figurinhaOfertaId,
          quantidade: {
            gt: 1
          }
        }
      });

      if (!figurinhaOferta) {
        return NextResponse.json(
          { error: 'Você não tem mais a figurinha ofertada disponível para troca' },
          { status: 400 }
        );
      }

      // Verificar se o usuário que fez a proposta ainda tem a figurinha solicitada
      const figurinhaSolicitada = await prisma.userFigurinha.findFirst({
        where: {
          userId: troca.usuarioRecebeId!,
          figurinhaId: troca.figurinhaSolicitadaId!,
          quantidade: {
            gt: 1
          }
        }
      });

      if (!figurinhaSolicitada) {
        return NextResponse.json(
          { error: 'O usuário que fez a proposta não tem mais a figurinha solicitada disponível para troca' },
          { status: 400 }
        );
      }

      // Realizar a troca
      await prisma.$transaction([
        // Atualizar a quantidade da figurinha ofertada do usuário atual
        prisma.userFigurinha.update({
          where: {
            id: figurinhaOferta.id
          },
          data: {
            quantidade: figurinhaOferta.quantidade - 1
          }
        }),

        // Adicionar a figurinha solicitada ao usuário atual
        prisma.userFigurinha.upsert({
          where: {
            userId_figurinhaId: {
              userId: user.id,
              figurinhaId: troca.figurinhaSolicitadaId!
            }
          },
          update: {
            quantidade: {
              increment: 1
            }
          },
          create: {
            userId: user.id,
            figurinhaId: troca.figurinhaSolicitadaId!,
            quantidade: 1
          }
        }),

        // Atualizar a quantidade da figurinha solicitada do usuário que fez a proposta
        prisma.userFigurinha.update({
          where: {
            id: figurinhaSolicitada.id
          },
          data: {
            quantidade: figurinhaSolicitada.quantidade - 1
          }
        }),

        // Adicionar a figurinha ofertada ao usuário que fez a proposta
        prisma.userFigurinha.upsert({
          where: {
            userId_figurinhaId: {
              userId: troca.usuarioRecebeId!,
              figurinhaId: troca.figurinhaOfertaId
            }
          },
          update: {
            quantidade: {
              increment: 1
            }
          },
          create: {
            userId: troca.usuarioRecebeId!,
            figurinhaId: troca.figurinhaOfertaId,
            quantidade: 1
          }
        }),

        // Atualizar o status da troca
        prisma.troca.update({
          where: { id: trocaId },
          data: { status: TrocaStatus.ACEITA }
        })
      ]);

      // Criar notificação para o usuário que fez a proposta
      try {
        console.log('Criando notificação de troca aceita para', troca.usuarioRecebeId);
        await prisma.notificacao.create({
          data: {
            usuarioId: troca.usuarioRecebeId!,
            tipo: 'TROCA_ACEITA',
            mensagem: `Sua proposta de troca pela figurinha ${troca.figurinhaOferta?.jogador?.nome || 'desconhecido'} foi aceita!`,
            lida: false,
            trocaId: trocaId
          }
        });
        console.log('Notificação de troca aceita criada com sucesso!');
      } catch (err) {
        console.error('Erro ao criar notificação de troca aceita:', err);
      }
    } else {
      // Atualizar o status da troca para recusado
      await prisma.troca.update({
        where: { id: trocaId },
        data: { status: TrocaStatus.RECUSADA }
      });
      // Criar notificação para o usuário que fez a proposta
      try {
        console.log('Criando notificação de troca recusada para', troca.usuarioRecebeId);
        await prisma.notificacao.create({
          data: {
            usuarioId: troca.usuarioRecebeId!,
            tipo: 'TROCA_RECUSADA',
            mensagem: `Sua proposta de troca pela figurinha ${troca.figurinhaOferta?.jogador?.nome || 'desconhecido'} foi recusada!`,
            lida: false,
            trocaId: trocaId
          }
        });
        console.log('Notificação de troca recusada criada com sucesso!');
      } catch (err) {
        console.error('Erro ao criar notificação de troca recusada:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao responder troca:', error);
    return NextResponse.json(
      { error: 'Erro ao responder troca' },
      { status: 500 }
    );
  }
} 