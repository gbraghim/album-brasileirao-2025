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

    // Total bruto de figurinhas (todas as figurinhas, incluindo repetidas)
    const totalBruto = user.pacotes.reduce((acc, pacote) => 
      acc + pacote.figurinhas.length, 0
    );
    console.log('Total bruto de figurinhas:', totalBruto);

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

    // Log das quantidades por jogador
    console.log('Quantidades por jogador:');
    jogadoresMap.forEach((quantidade, jogadorId) => {
      console.log(`Jogador ${jogadorId}: ${quantidade} figurinhas`);
    });

    // Figurinhas únicas (número de jogadores diferentes)
    const figurinhasUnicas = jogadoresMap.size;
    console.log('Figurinhas únicas:', figurinhasUnicas);

    // Figurinhas repetidas (total bruto - únicas)
    const figurinhasRepetidas = totalBruto - figurinhasUnicas;
    console.log('Figurinhas repetidas:', figurinhasRepetidas);

    // Total de figurinhas é o total bruto
    const totalFigurinhas = totalBruto;
    console.log('Total de figurinhas:', totalFigurinhas);

    // Calcula times completos
    const timesFigurinhas = new Map();
    user.pacotes.forEach(pacote => {
      pacote.figurinhas.forEach(figurinha => {
        const timeId = figurinha.jogador.timeId;
        if (!timesFigurinhas.has(timeId)) {
          timesFigurinhas.set(timeId, new Set());
        }
        timesFigurinhas.get(timeId).add(figurinha.jogador.id);
      });
    });

    // Para cada time, verifica se o usuário possui todos os jogadores
    const timesCompletos = await Promise.all(
      Array.from(timesFigurinhas.keys()).map(async (timeId) => {
        // Busca o total de jogadores do time
        const totalJogadoresTime = await prisma.jogador.count({
          where: { timeId }
        });

        // Verifica se o usuário possui todos os jogadores do time
        const jogadoresPossuidos = timesFigurinhas.get(timeId).size;
        return jogadoresPossuidos === totalJogadoresTime;
      })
    ).then(results => results.filter(Boolean).length);

    // Busca o total de times no banco de dados
    const totalTimes = await prisma.time.count();

    const stats: UserStats = {
      totalPacotes,
      totalFigurinhas,
      figurinhasRepetidas,
      timesCompletos,
      totalTimes
    };

    console.log('Estatísticas finais:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
} 