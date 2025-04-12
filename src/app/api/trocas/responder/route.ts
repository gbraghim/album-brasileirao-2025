import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId, aceitar } = await request.json();

    if (!trocaId || typeof aceitar !== 'boolean') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar a troca
    const troca = await prisma.troca.findUnique({
      where: { id: trocaId },
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
        usuarioEnvia: true,
        usuarioRecebe: true
      }
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário atual é o destinatário da troca
    if (!troca.usuarioRecebe || troca.usuarioRecebe.email !== session.user.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Atualizar o status da troca
    const trocaAtualizada = await prisma.troca.update({
      where: { id: trocaId },
      data: {
        status: aceitar ? 'ACEITA' : 'RECUSADA'
      },
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
        usuarioEnvia: true,
        usuarioRecebe: true
      }
    });

    if (aceitar) {
      // Se a troca foi aceita, transferir as figurinhas
      await prisma.$transaction([
        // Remover a figurinha do usuário que ofereceu
        prisma.userFigurinha.update({
          where: {
            userId_figurinhaId: {
              userId: troca.usuarioEnvia.id,
              figurinhaId: troca.figurinhaOferta.id
            }
          },
          data: {
            quantidade: {
              decrement: 1
            }
          }
        }),
        // Adicionar a figurinha ao usuário que recebeu
        prisma.userFigurinha.upsert({
          where: {
            userId_figurinhaId: {
              userId: troca.usuarioRecebe.id,
              figurinhaId: troca.figurinhaOferta.id
            }
          },
          update: {
            quantidade: {
              increment: 1
            }
          },
          create: {
            userId: troca.usuarioRecebe.id,
            figurinhaId: troca.figurinhaOferta.id,
            quantidade: 1
          }
        })
      ]);
    }

    return NextResponse.json(trocaAtualizada);
  } catch (error) {
    console.error('Erro ao responder proposta:', error);
    return NextResponse.json(
      { error: 'Erro ao responder proposta' },
      { status: 500 }
    );
  }
} 