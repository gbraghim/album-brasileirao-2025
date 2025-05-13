import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const id = request.url.split('/').pop();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacao = await prisma.notificacao.findUnique({
      where: { id }
    });

    if (!notificacao) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    if (notificacao.usuarioId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacaoAtualizada = await prisma.notificacao.update({
      where: { id },
      data: { lida: true }
    });

    return NextResponse.json(notificacaoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar notificação' },
      { status: 500 }
    );
  }
} 