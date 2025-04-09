import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Busca todas as figurinhas do usuário
    const figurinhas = await prisma.figurinha.findMany({
      where: {
        pacote: {
          user: {
            email: session.user.email
          }
        }
      }
    });

    // Conta quantas vezes cada jogador aparece
    const contagemJogadores = figurinhas.reduce((acc, figurinha) => {
      const jogadorId = figurinha.jogadorId;
      acc[jogadorId] = (acc[jogadorId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Filtra apenas os jogadores que aparecem mais de uma vez
    const jogadoresRepetidos = Object.entries(contagemJogadores)
      .filter(([_, count]) => count > 1)
      .map(([jogadorId]) => jogadorId);

    // Busca as figurinhas dos jogadores repetidos
    const figurinhasRepetidas = await prisma.figurinha.findMany({
      where: {
        jogadorId: {
          in: jogadoresRepetidos
        },
        pacote: {
          user: {
            email: session.user.email
          }
        }
      }
    });

    return NextResponse.json(figurinhasRepetidas);
  } catch (error) {
    console.error('Erro ao buscar figurinhas repetidas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar figurinhas repetidas' },
      { status: 500 }
    );
  }
} 