import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, TipoNotificacao } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        troca: {
          include: {
            figurinhaOferta: {
              include: {
                jogador: true,
              },
            },
            usuarioEnvia: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { mensagem, tipo, trocaId } = await request.json();

    if (!mensagem || !tipo) {
      return NextResponse.json({ error: 'Mensagem e tipo são obrigatórios' }, { status: 400 });
    }

    if (!Object.values(TipoNotificacao).includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de notificação inválido' }, { status: 400 });
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        mensagem,
        tipo: tipo as TipoNotificacao,
        usuarioId: session.user.id,
        trocaId,
      },
    });

    return NextResponse.json(notificacao);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json({ error: 'Erro ao criar notificação' }, { status: 500 });
  }
} 