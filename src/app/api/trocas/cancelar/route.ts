import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TrocaStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.error('Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId } = await request.json();
    console.log('TrocaId:', trocaId);
    console.log('UserId:', session.user.id);

    // Busca a troca
    const troca = await prisma.troca.findUnique({
      where: { id: trocaId },
      include: {
        usuarioEnvia: true,
        usuarioRecebe: true
      }
    });

    if (!troca) {
      console.error('Troca não encontrada:', trocaId);
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    console.log('Troca encontrada:', {
      id: troca.id,
      usuarioEnviaId: troca.usuarioEnviaId,
      usuarioRecebeId: troca.usuarioRecebeId,
      status: troca.status
    });

    // Permite cancelar se for o usuário que enviou a proposta (usuarioEnviaId) ou o que recebeu (usuarioRecebeId)
    if (troca.usuarioEnviaId !== session.user.id && troca.usuarioRecebeId !== session.user.id) {
      console.error('Usuário não tem permissão para cancelar:', {
        usuarioEnviaId: troca.usuarioEnviaId,
        usuarioRecebeId: troca.usuarioRecebeId,
        sessionUserId: session.user.id
      });
      return NextResponse.json({ error: 'Você não tem permissão para cancelar esta proposta' }, { status: 403 });
    }

    if (troca.status !== TrocaStatus.PENDENTE) {
      console.error('Troca não está pendente:', troca.status);
      return NextResponse.json({ error: 'A proposta não está mais pendente' }, { status: 400 });
    }

    await prisma.troca.update({
      where: { id: trocaId },
      data: { status: TrocaStatus.CANCELADA },
    });

    console.log('Troca cancelada com sucesso:', trocaId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao cancelar proposta:', error);
    return NextResponse.json({ error: 'Erro ao cancelar proposta' }, { status: 500 });
  }
} 