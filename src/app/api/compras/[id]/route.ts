import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const compra = await prisma.compra_figurinha.findUnique({
      where: { id: params.id },
      include: {
        produto: true
      }
    });

    if (!compra) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      );
    }

    if (compra.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(compra);
  } catch (error) {
    console.error('Erro ao buscar compra:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar compra' },
      { status: 500 }
    );
  }
} 