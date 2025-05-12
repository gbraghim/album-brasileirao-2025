import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const produtos = await prisma.produto_figurinha.findMany({
      where: {
        ativo: true
      },
      orderBy: {
        valor_centavos: 'asc'
      }
    });

    return NextResponse.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos de figurinhas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos de figurinhas' },
      { status: 500 }
    );
  }
} 