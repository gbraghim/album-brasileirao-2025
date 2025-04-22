import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { aceitar } = await request.json();
    const trocaId = params.id;

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
        figurinhaOferta: true,
        figurinhaSolicitada: true
      }
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é o destinatário da troca
    if (troca.usuarioRecebeId !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Verificar se a troca já foi respondida
    if (troca.status !== 'PENDENTE') {
      return NextResponse.json({ error: 'Troca já foi respondida' }, { status: 400 });
    }

    if (aceitar) {
      // Verificar se o usuário ainda tem a figurinha solicitada
      const figurinhaSolicitada = await prisma.userFigurinha.findFirst({
        where: {
          userId: user.id,
          figurinhaId: troca.figurinhaSolicitadaId!,
          quantidade: {
            gt: 1
          }
        }
      });

      if (!figurinhaSolicitada) {
        return NextResponse.json(
          { error: 'Você não tem mais a figurinha solicitada disponível para troca' },
          { status: 400 }
        );
      }

      // Verificar se o usuário que enviou a proposta ainda tem a figurinha oferecida
      const figurinhaOferta = await prisma.userFigurinha.findFirst({
        where: {
          userId: troca.usuarioEnviaId,
          figurinhaId: troca.figurinhaOfertaId,
          quantidade: {
            gt: 1
          }
        }
      });

      if (!figurinhaOferta) {
        return NextResponse.json(
          { error: 'O usuário não tem mais a figurinha oferecida disponível para troca' },
          { status: 400 }
        );
      }

      // Realizar a troca
      await prisma.$transaction([
        // Atualizar a quantidade da figurinha solicitada do usuário atual
        prisma.userFigurinha.update({
          where: {
            id: figurinhaSolicitada.id
          },
          data: {
            quantidade: figurinhaSolicitada.quantidade - 1
          }
        }),

        // Adicionar a figurinha oferecida ao usuário atual
        prisma.userFigurinha.upsert({
          where: {
            userId_figurinhaId: {
              userId: user.id,
              figurinhaId: troca.figurinhaOfertaId
            }
          },
          update: {
            quantidade: {
              increment: 1
            }
          },
          create: {
            userId: user.id,
            figurinhaId: troca.figurinhaOfertaId,
            quantidade: 1
          }
        }),

        // Atualizar a quantidade da figurinha oferecida do usuário que enviou a proposta
        prisma.userFigurinha.update({
          where: {
            id: figurinhaOferta.id
          },
          data: {
            quantidade: figurinhaOferta.quantidade - 1
          }
        }),

        // Adicionar a figurinha solicitada ao usuário que enviou a proposta
        prisma.userFigurinha.upsert({
          where: {
            userId_figurinhaId: {
              userId: troca.usuarioEnviaId,
              figurinhaId: troca.figurinhaSolicitadaId!
            }
          },
          update: {
            quantidade: {
              increment: 1
            }
          },
          create: {
            userId: troca.usuarioEnviaId,
            figurinhaId: troca.figurinhaSolicitadaId!,
            quantidade: 1
          }
        }),

        // Atualizar o status da troca
        prisma.troca.update({
          where: { id: trocaId },
          data: { status: 'ACEITO' }
        })
      ]);
    } else {
      // Atualizar o status da troca para recusado
      await prisma.troca.update({
        where: { id: trocaId },
        data: { status: 'RECUSADO' }
      });
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