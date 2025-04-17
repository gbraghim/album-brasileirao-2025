import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const trocaInclude = {
  figurinhaOferta: {
    include: {
      jogador: {
        select: {
          id: true,
          nome: true,
          posicao: true,
          numero: true,
          foto: true,
          time: {
            select: {
              id: true,
              nome: true,
              escudo: true
            }
          }
        }
      }
    }
  },
  usuarioEnvia: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  usuarioRecebe: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.TrocaInclude;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId, figurinhaSolicitadaId } = await req.json();

    if (!trocaId || !figurinhaSolicitadaId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Verifica se a troca existe e está pendente
    const troca = await prisma.troca.findUnique({
      where: { 
        id: trocaId,
        status: 'PENDENTE'
      },
      include: trocaInclude
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada ou não está mais pendente' }, { status: 404 });
    }

    // Verificar se o usuário é o destinatário da troca
    if (troca.usuarioRecebeId !== session.user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para responder a esta troca' }, { status: 403 });
    }

    // Verifica se a figurinha solicitada pertence ao usuário
    const figurinhaSolicitada = await prisma.userFigurinha.findFirst({
      where: {
        userId: session.user.id,
        figurinhaId: figurinhaSolicitadaId,
        quantidade: {
          gt: 1
        }
      }
    });

    if (!figurinhaSolicitada) {
      return NextResponse.json(
        { error: 'Figurinha não encontrada ou não está disponível para troca' },
        { status: 404 }
      );
    }

    // Atualiza a troca com a figurinha solicitada
    const trocaAtualizada = await prisma.troca.update({
      where: { id: trocaId },
      data: {
        figurinhaSolicitada: {
          connect: {
            id: figurinhaSolicitadaId
          }
        }
      },
      include: trocaInclude
    });

    return NextResponse.json(trocaAtualizada);
  } catch (error) {
    console.error('Erro ao propor troca:', error);
    return NextResponse.json(
      { error: 'Erro ao propor troca' },
      { status: 500 }
    );
  }
} 