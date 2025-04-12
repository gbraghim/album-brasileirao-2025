import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Jogador } from '@/types/jogador';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar as figurinhas do usuário
    const userFigurinhas = await prisma.userFigurinha.findMany({
      where: {
        user: {
          email: session.user.email
        },
        quantidade: {
          gt: 1 // Apenas figurinhas com quantidade maior que 1 (repetidas)
        }
      },
      include: {
        figurinha: {
          include: {
            jogador: {
              include: {
                time: true
              }
            }
          }
        }
      }
    });

    // Transformar os dados para o formato esperado
    const jogadoresRepetidos = userFigurinhas.map(uf => ({
      ...uf.figurinha.jogador,
      quantidade: uf.quantidade
    }));

    return NextResponse.json({ jogadores: jogadoresRepetidos });
  } catch (error) {
    console.error('Erro ao buscar repetidas:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar repetidas' },
      { status: 500 }
    );
  }
} 