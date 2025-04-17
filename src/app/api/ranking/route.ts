import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RankingItem {
  id: string;
  nome: string;
  totalFigurinhas: number;
  email: string;
  posicao: number;
}

interface RankingResponse {
  ranking: RankingItem[];
  usuarioAtual?: RankingItem;
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
            figurinhas: true
          }
        }
      }
    });

    // Calcula o ranking ordenando por quantidade total de figurinhas
    const rankingCompleto = usuarios
      .map(usuario => {
        const totalFigurinhas = usuario.pacotes.reduce((total, pacote) => 
          total + pacote.figurinhas.length, 0
        );

        return {
          id: usuario.id,
          nome: usuario.name || '',
          email: usuario.email || '',
          totalFigurinhas
        };
      })
      .sort((a, b) => b.totalFigurinhas - a.totalFigurinhas)
      .map((usuario, index) => ({
        ...usuario,
        posicao: index + 1
      }));

    // Encontra a posição do usuário atual
    const usuarioAtual = rankingCompleto.find(u => u.email === session.user?.email);

    // Limita o ranking aos 20 primeiros
    const rankingLimitado = rankingCompleto.slice(0, 20);

    // Se o usuário atual não está no top 20 e existe, adiciona sua posição
    const response: RankingResponse = {
      ranking: rankingLimitado,
      usuarioAtual: usuarioAtual && !rankingLimitado.find(u => u.email === usuarioAtual.email) 
        ? usuarioAtual 
        : undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json({ error: 'Erro ao buscar ranking' }, { status: 500 });
  }
} 