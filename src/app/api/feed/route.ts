import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Retorna os 50 eventos mais recentes do feed (figurinhas raras e pacotes comprados)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const take = 50;

  // Busca eventos de figurinhas Ouro/Lendário obtidas
  const figurinhas = await prisma.userFigurinha.findMany({
    where: {
      figurinha: {
        raridade: { in: ['Ouro', 'Lendário'] },
      },
    },
    include: {
      user: true,
      figurinha: {
        include: {
          jogador: {
            include: { time: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    take,
  });

  // Busca eventos de pacotes comprados
  const pacotes = await prisma.pacote.findMany({
    where: {
      tipo: 'COMPRADO',
    },
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    take,
  });

  // Unifica e ordena todos os eventos por data decrescente
  const eventos = [
    ...figurinhas.map(f => ({
      tipo: f.figurinha.raridade === 'Ouro' ? 'ouro' : 'lendaria',
      usuario: f.user.name || 'Usuário',
      jogador: f.figurinha.jogador?.nome || '',
      time: f.figurinha.jogador?.time?.nome || '',
      raridade: f.figurinha.raridade,
      createdAt: f.createdAt,
      id: f.id,
    })),
    ...pacotes.map(p => ({
      tipo: 'pacote',
      usuario: p.user.name || 'Usuário',
      createdAt: p.createdAt,
      id: p.id,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Paginação cursor-based: retorna o cursor do último evento
  const nextCursor = eventos.length === take ? eventos[take - 1].id : null;

  return NextResponse.json({ eventos: eventos.slice(0, take), nextCursor });
} 