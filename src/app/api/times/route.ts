import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const times = await prisma.time.findMany({
      include: {
        _count: {
          select: {
            jogadores: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(times);
  } catch (error) {
    console.error('Erro ao buscar times:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar times' },
      { status: 500 }
    );
  }
} 