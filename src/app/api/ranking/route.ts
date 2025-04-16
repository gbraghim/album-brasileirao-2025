import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface RankingItem {
  id: string;
  name: string;
  figurinhas: number;
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
        figurinhas: {
          select: {
            quantidade: true
          }
        }
      }
    });

    // Calcula o ranking ordenando por quantidade total de figurinhas
    const ranking = usuarios
      .map(usuario => ({
        id: usuario.id,
        name: usuario.name,
        figurinhas: usuario.figurinhas.reduce((total, item) => total + item.quantidade, 0)
      }))
      .sort((a, b) => b.figurinhas - a.figurinhas);

    return NextResponse.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json({ error: 'Erro ao buscar ranking' }, { status: 500 });
  }
} 