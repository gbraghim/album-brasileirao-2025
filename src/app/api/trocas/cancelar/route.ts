import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TrocaStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId } = await request.json();

    // Busca a troca
    const troca = await prisma.troca.findUnique({
      where: { id: trocaId },
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    // Permite cancelar se for o usuário que enviou a proposta (usuarioRecebeId)
    if (troca.usuarioRecebeId !== session.user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para cancelar esta proposta' }, { status: 403 });
    }

    if (troca.status !== TrocaStatus.PENDENTE) {
      return NextResponse.json({ error: 'A proposta não está mais pendente' }, { status: 400 });
    }

    await prisma.troca.update({
      where: { id: trocaId },
      data: { status: TrocaStatus.CANCELADA },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cancelar proposta' }, { status: 500 });
  }
} 