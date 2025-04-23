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
        pacotes: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Calcula as estatísticas básicas
    const totalPacotes = user.pacotes.length;

    // Busca todas as figurinhas do usuário, incluindo repetidas
    const userFigurinhas = await prisma.userFigurinha.findMany({
      where: {
        userId: user.id
      }
    });

    // Total de figurinhas únicas
    const figurinhasUnicas = userFigurinhas.length;

    // Busca figurinhas repetidas (quantidade > 1)
    const figurinhasRepetidasQuery = await prisma.userFigurinha.findMany({
      where: {
        userId: user.id,
        quantidade: {
          gt: 1
        }
      }
    });

    console.log('API Stats - Figurinhas repetidas encontradas:', 
      figurinhasRepetidasQuery.map(f => ({
        figurinhaId: f.figurinhaId,
        quantidade: f.quantidade
      }))
    );

    // Calcula o total de repetidas (número de figurinhas com quantidade > 1)
    const figurinhasRepetidas = figurinhasRepetidasQuery.length;

    // Total bruto de figurinhas (únicas + repetidas)
    const totalFigurinhas = userFigurinhas.reduce(
      (acc, fig) => acc + fig.quantidade,
      0
    );

    // Calcula times completos
    const timesFigurinhas = await prisma.userFigurinha.findMany({
      where: {
        userId: user.id,
        quantidade: {
          gt: 0
        }
      },
      include: {
        figurinha: {
          include: {
            jogador: {
              select: {
                timeId: true
              }
            }
          }
        }
      }
    });

    const jogadoresPorTime = new Map();
    timesFigurinhas.forEach(uf => {
      const timeId = uf.figurinha.jogador?.timeId;
      if (!timeId) return;
      
      if (!jogadoresPorTime.has(timeId)) {
        jogadoresPorTime.set(timeId, new Set());
      }
      jogadoresPorTime.get(timeId).add(uf.figurinha.jogadorId);
    });

    // Para cada time, verifica se o usuário possui todos os jogadores
    const timesCompletos = await Promise.all(
      Array.from(jogadoresPorTime.keys()).map(async (timeId) => {
        const totalJogadoresTime = await prisma.jogador.count({
          where: { timeId }
        });
        const jogadoresPossuidos = jogadoresPorTime.get(timeId).size;
        return jogadoresPossuidos === totalJogadoresTime;
      })
    ).then(results => results.filter(Boolean).length);

    // Busca o total de times no banco de dados
    const totalTimes = await prisma.time.count();

    // Busca o total de jogadores no banco de dados
    const totalJogadoresBase = await prisma.jogador.count();

    const stats: UserStats = {
      totalPacotes,
      totalFigurinhas,
      figurinhasRepetidas,
      timesCompletos,
      totalTimes,
      totalJogadoresBase
    };

    console.log('API - Estatísticas finais:', {
      ...stats,
      figurinhasRepetidasDetalhes: figurinhasRepetidasQuery.map(f => ({
        id: f.figurinhaId,
        quantidade: f.quantidade
      }))
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
} 