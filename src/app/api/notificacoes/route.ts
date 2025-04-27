import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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