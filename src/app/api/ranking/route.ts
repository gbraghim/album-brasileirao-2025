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
        // Total bruto de figurinhas (todas as figurinhas, incluindo repetidas)
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
      .sort((a, b) => b.totalFigurinhas - a.totalFigurinhas);

    return NextResponse.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json({ error: 'Erro ao buscar ranking' }, { status: 500 });
  }
} 