import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RankingItem {
  id: string;
  nome: string;
  totalFigurinhas: number;
  email: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca todos os usuários e suas figurinhas
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
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

    // Calcula o ranking ordenando por quantidade total de figurinhas
    const ranking = usuarios
      .map(usuario => {
        // Conta todas as figurinhas do usuário
        const jogadoresMap = new Map();
        usuario.pacotes.forEach(pacote => {
          pacote.figurinhas.forEach(figurinha => {
            const jogadorId = figurinha.jogador.id;
            if (!jogadoresMap.has(jogadorId)) {
              jogadoresMap.set(jogadorId, 1);
            } else {
              jogadoresMap.set(jogadorId, jogadoresMap.get(jogadorId) + 1);
            }
          });
        });

        // Figurinhas únicas é o número de jogadores diferentes
        const figurinhasUnicas = jogadoresMap.size;

        // Figurinhas repetidas é a soma das quantidades extras de cada jogador
        const figurinhasRepetidas = Array.from(jogadoresMap.values())
          .reduce((acc, quantidade) => acc + Math.max(0, quantidade - 1), 0);

        // Total é a soma das únicas mais as repetidas
        const totalFigurinhas = figurinhasUnicas + figurinhasRepetidas;

        return {
          id: usuario.id,
          nome: usuario.name || '',
          email: usuario.email || '',
          totalFigurinhas
        };
      })
      .sort((a, b) => b.totalFigurinhas - a.totalFigurinhas);

    return NextResponse.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json({ error: 'Erro ao buscar ranking' }, { status: 500 });
  }
} 