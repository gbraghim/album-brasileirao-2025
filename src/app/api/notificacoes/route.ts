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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: session.user.id,
      },
      include: {
        troca: {
          include: trocaInclude
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { tipo, mensagem, trocaId, usuarioId } = await request.json();

    if (!tipo || !mensagem || !usuarioId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        tipo,
        mensagem,
        trocaId,
        usuarioId
      },
      include: {
        troca: {
          include: trocaInclude
        }
      }
    });

    return NextResponse.json(notificacao);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
} 