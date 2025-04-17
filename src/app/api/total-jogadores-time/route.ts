import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca o total de jogadores por time
    const totalJogadoresPorTime = await prisma.jogador.groupBy({
      by: ['timeId'],
      _count: {
        id: true,
      },
    });

    // Converte o resultado para um objeto com o formato { timeId: total }
    const resultado = totalJogadoresPorTime.reduce((acc: Record<string, number>, item: { timeId: string; _count: { id: number } }) => {
      acc[item.timeId] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar total de jogadores por time:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar total de jogadores por time' },
      { status: 500 }
    );
  }
} 