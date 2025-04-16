import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import type { UserStats } from '@/types/stats';

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
            figurinhas: {
              include: {
                jogador: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Calcula as estatísticas
    const totalPacotes = user.pacotes.length;

    // Conta figurinhas por jogador
    const jogadoresMap = new Map();
    user.pacotes.forEach(pacote => {
      pacote.figurinhas.forEach(figurinha => {
        const jogadorId = figurinha.jogador.id;
        if (!jogadoresMap.has(jogadorId)) {
          jogadoresMap.set(jogadorId, 1);
        } else {
          jogadoresMap.set(jogadorId, jogadoresMap.get(jogadorId) + 1);
        }
      });
    });

    // Calcula figurinhas únicas (número de jogadores diferentes)
    const figurinhasUnicas = jogadoresMap.size;

    // Calcula figurinhas repetidas
    const figurinhasRepetidas = Array.from(jogadoresMap.values())
      .reduce((acc, quantidade) => acc + Math.max(0, quantidade - 1), 0);

    // Total de figurinhas é a soma das únicas mais as repetidas
    const totalFigurinhas = figurinhasUnicas + figurinhasRepetidas;

    // Calcula times completos
    const timesFigurinhas = new Map();
    user.pacotes.forEach(pacote => {
      pacote.figurinhas.forEach(figurinha => {
        const timeId = figurinha.jogador.timeId;
        if (!timesFigurinhas.has(timeId)) {
          timesFigurinhas.set(timeId, new Set());
        }
        timesFigurinhas.get(timeId).add(figurinha.jogador.numero);
      });
    });

    // Conta quantos times estão completos (assumindo que cada time tem 30 figurinhas)
    const timesCompletos = Array.from(timesFigurinhas.values())
      .filter(jogadores => jogadores.size === 30)
      .length;

    const stats: UserStats = {
      totalPacotes,
      totalFigurinhas,
      figurinhasRepetidas,
      timesCompletos,
      totalTimes: 20 // Total de times no Brasileirão
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