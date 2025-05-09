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
      select: {
        id: true,
        qtdFigurinhasLendarias: true,
        qtdFigurinhasOuro: true,
        qtdFigurinhasPrata: true,
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

    // Busca todas as figurinhas do usuário, incluindo repetidas e dados do jogador
    const userFigurinhasComJogador = await prisma.userFigurinha.findMany({
      where: {
        userId: user.id
      },
      include: {
        figurinha: {
          include: {
            jogador: true
          }
        }
      }
    });

    // Total de figurinhas únicas (desconsiderando repetidas)
    const totalFigurinhas = userFigurinhasComJogador.length;

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

    console.log('API Stats - Resumo:', {
      totalFigurinhasUnicas: totalFigurinhas,
      figurinhasRepetidas,
      userFigurinhas: userFigurinhasComJogador.map(f => ({
        figurinhaId: f.figurinhaId,
        quantidade: f.quantidade
      }))
    });

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

    // Mapear jogadores únicos do usuário (por jogadorId)
    const jogadoresUnicos = new Map();
    userFigurinhasComJogador.forEach(uf => {
      const jogador = uf.figurinha.jogador;
      if (jogador && !jogadoresUnicos.has(jogador.id)) {
        jogadoresUnicos.set(jogador.id, jogador.raridade || 'Prata');
      }
    });

    // Contar jogadores únicos por raridade
    let figurinhasLendarias = 0;
    let figurinhasOuro = 0;
    let figurinhasPrata = 0;
    for (const raridade of jogadoresUnicos.values()) {
      if (raridade === 'Lendário') figurinhasLendarias++;
      else if (raridade === 'Ouro') figurinhasOuro++;
      else figurinhasPrata++;
    }

    // Corrigir totalFigurinhas para ser igual ao total de jogadores únicos
    const totalFigurinhasUnicas = figurinhasLendarias + figurinhasOuro + figurinhasPrata;

    const stats: UserStats = {
      totalPacotes: user?.pacotes?.length ?? 0,
      totalFigurinhas: totalFigurinhasUnicas,
      figurinhasRepetidas,
      timesCompletos,
      totalTimes,
      totalJogadoresBase,
      figurinhasLendarias,
      totalFigurinhasLendarias: figurinhasLendarias,
      figurinhasOuro,
      totalFigurinhasOuro: figurinhasOuro,
      figurinhasPrata,
      totalFigurinhasPrata: figurinhasPrata
    };

    console.log('API - Estatísticas finais:', {
      ...stats,
      figurinhasRepetidasDetalhes: figurinhasRepetidasQuery.map(f => ({
        id: f.figurinhaId,
        quantidade: f.quantidade
      }))
    });

    // Buscar todos os times
    const allTimes = await prisma.time.findMany({
      select: { id: true, nome: true }
    });

    // Para cada time, verificar se está completo e retornar também as quantidades
    const timesDetalhados = await Promise.all(
      allTimes.map(async (time) => {
        const totalJogadoresTime = await prisma.jogador.count({ where: { timeId: time.id } });
        const jogadoresPossuidos = jogadoresPorTime.get(time.id)?.size || 0;
        return {
          nome: time.nome,
          completo: jogadoresPossuidos === totalJogadoresTime,
          figurinhasObtidas: jogadoresPossuidos,
          totalFigurinhas: totalJogadoresTime,
        };
      })
    );

    return NextResponse.json({ ...stats, timesDetalhados });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
} 