import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface FigurinhaRepetida {
  jogadorId: string;
  nome: string;
  posicao: string | null;
  quantidade: number;
}

interface UserFigurinha {
  figurinha: {
    jogadorId: string | null;
    jogador: {
      nome: string;
      posicao: string | null;
    } | null;
  };
  quantidade: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Busca todas as figurinhas do usuário com quantidade > 1
    const userFigurinhas = await prisma.userFigurinha.findMany({
      where: {
        userId: user.id,
        quantidade: {
          gt: 1
        }
      },
      include: {
        figurinha: {
          include: {
            jogador: true
          }
        }
      }
    });

    // Formata as figurinhas repetidas
    const figurinhasRepetidas = userFigurinhas.map((uf: UserFigurinha) => ({
      jogadorId: uf.figurinha.jogadorId || '',
      nome: uf.figurinha.jogador?.nome || '',
      posicao: uf.figurinha.jogador?.posicao || null,
      quantidade: uf.quantidade
    }));

    return NextResponse.json(figurinhasRepetidas);
  } catch (error) {
    console.error('Erro ao buscar figurinhas repetidas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar figurinhas repetidas' },
      { status: 500 }
    );
  }
} 