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
    const resultado = totalJogadoresPorTime.reduce((acc: Record<string, number>, item) => {
      // Converte o ID do time para o formato usado no frontend (ex: 'flamengo', 'sao-paulo', etc)
      const timeId = item.timeId.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-');
      acc[timeId] = item._count.id;
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