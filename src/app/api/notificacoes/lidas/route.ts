import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const updated = await prisma.notificacao.updateMany({
      where: {
        usuarioId: session.user.id,
        lida: false
      },
      data: {
        lida: true
      }
    });

    return NextResponse.json({ 
      success: true,
      updated: updated.count
    });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
} 