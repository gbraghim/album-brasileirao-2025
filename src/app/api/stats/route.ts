import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import type { UserStats } from '@/types/stats';
import type { User } from '@prisma/client';

type UserWithPacotes = User & {
  pacotes: {
    figurinhas: {
      id: string;
      numero: number;
      time: string;
      repetida: boolean;
    }[];
  }[];
};

// Lista de times do Brasileirão 2025
const TIMES_BRASILEIRAO = [
  'Flamengo',
  'Palmeiras',
  'Grêmio',
  'São Paulo',
  'Fluminense',
  'Atlético-MG',
  'Corinthians',
  'Internacional',
  'Athletico-PR',
  'Vasco',
  'Botafogo',
  'Santos',
  'Cruzeiro',
  'Bahia',
  'Fortaleza',
  'Red Bull Bragantino',
  'Cuiabá',
  'Atlético-GO',
  'Vitória',
  'Juventude'
];

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pacotes: {
          include: {
            figurinhas: true
          }
        }
      }
    }) as UserWithPacotes | null;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Calcula as estatísticas
    const totalPacotes = user.pacotes.length;
    const totalFigurinhas = user.pacotes.reduce((acc, pacote) => 
      acc + pacote.figurinhas.length, 0
    );
    const figurinhasRepetidas = user.pacotes.reduce((acc, pacote) => 
      acc + pacote.figurinhas.filter(f => f.repetida).length, 0
    );

    // Calcula times completos
    const figurinhasPorTime = new Map<string, Set<number>>();
    
    // Inicializa o Map com todos os times
    TIMES_BRASILEIRAO.forEach(time => {
      figurinhasPorTime.set(time, new Set());
    });

    // Preenche o Map com as figurinhas do usuário
    user.pacotes.forEach(pacote => {
      pacote.figurinhas.forEach(figurinha => {
        if (!figurinha.repetida) {
          const figurinhasDoTime = figurinhasPorTime.get(figurinha.time);
          if (figurinhasDoTime) {
            figurinhasDoTime.add(figurinha.numero);
          }
        }
      });
    });

    // Conta quantos times estão completos (assumindo que cada time tem 30 figurinhas)
    const timesCompletos = Array.from(figurinhasPorTime.values())
      .filter(figurinhas => figurinhas.size === 30)
      .length;

    const stats: UserStats = {
      totalPacotes,
      totalFigurinhas,
      figurinhasRepetidas,
      timesCompletos,
      totalTimes: TIMES_BRASILEIRAO.length
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
} 