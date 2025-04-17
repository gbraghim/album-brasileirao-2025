import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type RouteParams = {
  params: Promise<{
    id: string;
  }>
}

export async function PATCH(request: Request, props: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const params = await props.params;

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacao = await prisma.notificacao.findUnique({
      where: { id: params.id }
    });

    if (!notificacao) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    if (notificacao.usuarioId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacaoAtualizada = await prisma.notificacao.update({
      where: { id: params.id },
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