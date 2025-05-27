import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import type { UserStats } from '@/types/stats';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca todas as figurinhas do usuário, incluindo jogador e time
    const userFigurinhas = await prisma.userFigurinha.findMany({
      where: { user: { email: session.user.email } },
      include: {
        figurinha: {
          include: {
            jogador: {
              select: { id: true, timeId: true, raridade: true }
            }
          }
        }
      }
    });

    // Busca todos os times e jogadores (para saber o total de jogadores por time)
    const [allTimes, allJogadores] = await Promise.all([
      prisma.time.findMany({ select: { id: true, nome: true } }),
      prisma.jogador.findMany({ select: { id: true, timeId: true } })
    ]);

    // Mapas auxiliares
    const jogadoresPorTime: Record<string, Set<string>> = {};
    const jogadoresUnicos: Record<string, string> = {};
    let figurinhasRepetidas = 0;
    let figurinhasLendarias = 0;
    let figurinhasOuro = 0;
    let figurinhasPrata = 0;
    let totalFigurinhas = 0;
    let totalPacotes = 0;

    userFigurinhas.forEach(uf => {
      const jogador = uf.figurinha.jogador;
      if (!jogador) return;
      totalFigurinhas++;
      if (!jogadoresUnicos[jogador.id]) {
        jogadoresUnicos[jogador.id] = jogador.raridade || 'Prata';
      }
      if (!jogadoresPorTime[jogador.timeId]) {
        jogadoresPorTime[jogador.timeId] = new Set();
      }
      jogadoresPorTime[jogador.timeId].add(jogador.id);
      if (uf.quantidade > 1) figurinhasRepetidas++;
    });

    // Contar raridades
    Object.values(jogadoresUnicos).forEach(raridade => {
      if (raridade === 'Lendário') {
        figurinhasLendarias++;
        totalFigurinhasLendarias: figurinhasLendarias;
      }
      else if (raridade === 'Ouro') {
        figurinhasOuro++;
        totalFigurinhasOuro: figurinhasOuro;
      }
      else figurinhasPrata++;
    });

    // Calcular times completos
    const timesDetalhados = allTimes.map(time => {
      const totalJogadoresTime = allJogadores.filter(j => j.timeId === time.id).length;
      const jogadoresPossuidos = jogadoresPorTime[time.id]?.size || 0;
      return {
        nome: time.nome,
        completo: jogadoresPossuidos === totalJogadoresTime && totalJogadoresTime > 0,
        figurinhasObtidas: jogadoresPossuidos,
        totalFigurinhas: totalJogadoresTime
      };
    });
    const timesCompletos = timesDetalhados.filter(t => t.completo).length;

    // Totais
    const totalTimes = allTimes.length;
    const totalJogadoresBase = allJogadores.length;
    const totalFigurinhasUnicas = Object.keys(jogadoresUnicos).length;

    // Busca pacotes do usuário (apenas para contar)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { pacotes: true }
    });
    totalPacotes = user?.pacotes?.length ?? 0;

    // Buscar total de usuários cadastrados
    const totalUsuarios = await prisma.user.count();

    const stats: UserStats = {
      totalPacotes,
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
      totalFigurinhasPrata: figurinhasPrata,
      timesDetalhados,
      totalUsuarios
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
} 