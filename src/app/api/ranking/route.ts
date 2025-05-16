import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca otimizada: total de figurinhas (incluindo repetidas)
    const totalFigurinhas = await prisma.userFigurinha.groupBy({
      by: ['userId'],
      _sum: { quantidade: true },
    });
    const users = await prisma.user.findMany({ select: { id: true, name: true, image: true } });
    const userMap = Object.fromEntries(users.filter(u => !!u.id).map(u => [u.id, u]));
    const totalFigurinhasRanking = totalFigurinhas.filter(tf => !!tf.userId).map(tf => ({
      nome: userMap[tf.userId]?.name || 'Desconhecido',
      valor: tf._sum.quantidade || 0,
      foto: userMap[tf.userId]?.image,
      userId: tf.userId
    })).sort((a, b) => b.valor - a.valor).map((item, idx) => ({ ...item, posicao: idx + 1 }));

    // Figurinhas únicas
    const unicas = await prisma.userFigurinha.groupBy({
      by: ['userId'],
      _count: { figurinhaId: true },
    });
    const figurinhasUnicasRanking = unicas.filter(u => !!u.userId).map(u => ({
      nome: userMap[u.userId]?.name || 'Desconhecido',
      valor: u._count.figurinhaId,
      foto: userMap[u.userId]?.image,
      userId: u.userId
    })).sort((a, b) => b.valor - a.valor).map((item, idx) => ({ ...item, posicao: idx + 1 }));

    // Figurinhas Lendárias
    const lendarias = await prisma.userFigurinha.groupBy({
      by: ['userId'],
      where: { figurinha: { jogador: { raridade: 'Lendário' } } },
      _sum: { quantidade: true },
    });
    const figurinhasLendariasRanking = lendarias.filter(u => !!u.userId).map(u => ({
      nome: userMap[u.userId]?.name || 'Desconhecido',
      valor: u._sum.quantidade || 0,
      foto: userMap[u.userId]?.image,
      userId: u.userId
    })).sort((a, b) => b.valor - a.valor).map((item, idx) => ({ ...item, posicao: idx + 1 }));

    // Figurinhas Ouro
    const ouros = await prisma.userFigurinha.groupBy({
      by: ['userId'],
      where: { figurinha: { jogador: { raridade: 'Ouro' } } },
      _sum: { quantidade: true },
    });
    const figurinhasOuroRanking = ouros.filter(u => !!u.userId).map(u => ({
      nome: userMap[u.userId]?.name || 'Desconhecido',
      valor: u._sum.quantidade || 0,
      foto: userMap[u.userId]?.image,
      userId: u.userId
    })).sort((a, b) => b.valor - a.valor).map((item, idx) => ({ ...item, posicao: idx + 1 }));

    // Figurinhas Prata
    const pratas = await prisma.userFigurinha.groupBy({
      by: ['userId'],
      where: { figurinha: { jogador: { raridade: 'Prata' } } },
      _sum: { quantidade: true },
    });
    const figurinhasPrataRanking = pratas.filter(u => !!u.userId).map(u => ({
      nome: userMap[u.userId]?.name || 'Desconhecido',
      valor: u._sum.quantidade || 0,
      foto: userMap[u.userId]?.image,
      userId: u.userId
    })).sort((a, b) => b.valor - a.valor).map((item, idx) => ({ ...item, posicao: idx + 1 }));

    // Trocas realizadas (aceitas)
    const trocas = await prisma.troca.findMany({
      where: { status: 'ACEITA' },
      select: { usuarioEnviaId: true, usuarioRecebeId: true }
    });
    const trocasPorUsuario: Record<string, number> = {};
    trocas.forEach(t => {
      if (t.usuarioEnviaId) {
        trocasPorUsuario[t.usuarioEnviaId] = (trocasPorUsuario[t.usuarioEnviaId] || 0) + 1;
      }
      if (t.usuarioRecebeId) {
        trocasPorUsuario[t.usuarioRecebeId] = (trocasPorUsuario[t.usuarioRecebeId] || 0) + 1;
      }
    });
    const trocasRanking = users.map(u => ({
      nome: u.name || 'Desconhecido',
      valor: trocasPorUsuario[u.id] || 0,
      foto: u.image,
      userId: u.id
    })).sort((a, b) => b.valor - a.valor).map((item, idx) => ({ ...item, posicao: idx + 1 }));

    // Pacotes abertos
    const pacotes = await prisma.pacote.groupBy({
      by: ['userId'],
      _count: { id: true },
    });
    const pacotesRanking = pacotes.filter(p => !!p.userId).map(p => ({
      nome: userMap[p.userId]?.name || 'Desconhecido',
      valor: p._count.id,
      foto: userMap[p.userId]?.image,
      userId: p.userId
    })).sort((a, b) => b.valor - a.valor).map((item, idx) => ({ ...item, posicao: idx + 1 }));

    // Pacotes comprados (apenas tipo 'COMPRADO')
    const pacotesComprados = await prisma.pacote.groupBy({
      by: ['userId'],
      where: { tipo: 'COMPRADO' },
      _count: { id: true },
    });
    const pacotesCompradosRanking = pacotesComprados
      .filter(p => !!p.userId && p._count.id > 0)
      .map(p => ({
        nome: userMap[p.userId]?.name || 'Desconhecido',
        valor: p._count.id,
        foto: userMap[p.userId]?.image,
        userId: p.userId
      }))
      .sort((a, b) => b.valor - a.valor)
      .map((item, idx) => ({ ...item, posicao: idx + 1 }));

    const rankings = {
      totalFigurinhas: totalFigurinhasRanking,
      figurinhasUnicas: figurinhasUnicasRanking,
      figurinhasLendarias: figurinhasLendariasRanking,
      figurinhasOuro: figurinhasOuroRanking,
      figurinhasPrata: figurinhasPrataRanking,
      trocasRealizadas: trocasRanking,
      pacotesAbertos: pacotesRanking,
      pacotesComprados: pacotesCompradosRanking
    };

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Erro ao buscar rankings:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar rankings' },
      { status: 500 }
    );
  }
} 