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
  totalUsuarios: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca o total de figurinhas por usuário em uma única query
    const totais = await prisma.userFigurinha.groupBy({
      by: ['userId'],
      _sum: { quantidade: true }
    });
    console.log('Ranking totais:', totais);

    // Busca os dados dos usuários que têm figurinhas
    const userIds = totais.map(t => t.userId);
    const usuarios = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });
    console.log('Ranking usuarios:', usuarios);

    // Monta o ranking
    const rankingArray = totais.map(t => {
      const usuario = usuarios.find(u => u.id === t.userId);
      return {
        id: t.userId,
        nome: usuario?.name || '',
        email: usuario?.email || '',
        totalFigurinhas: t._sum.quantidade || 0
      };
    });

    // Ordena e monta o ranking final
    const rankingCompleto = rankingArray
      .sort((a, b) => b.totalFigurinhas - a.totalFigurinhas)
      .map((usuario, index) => ({
        ...usuario,
        posicao: index + 1
      }));

    const usuarioAtual = rankingCompleto.find(u => u.email === session.user?.email);
    const rankingLimitado = rankingCompleto.slice(0, 20);

    // Se não houver ninguém no ranking, retorna mensagem amigável
    if (rankingLimitado.length === 0) {
      return NextResponse.json({ ranking: [], mensagem: 'Nenhum colecionador com figurinhas ainda.' });
    }

    // Buscar o total de usuários no sistema
    const totalUsuarios = await prisma.user.count();

    const response: RankingResponse = {
      ranking: rankingLimitado,
      usuarioAtual: usuarioAtual && !rankingLimitado.find(u => u.email === usuarioAtual.email)
        ? usuarioAtual
        : undefined,
      totalUsuarios: totalUsuarios
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json({ error: 'Erro ao buscar ranking' }, { status: 500 });
  }
} 