import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jogadores = await prisma.jogador.findMany({
      include: {
        time: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    return NextResponse.json(jogadores);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar jogadores' },
      { status: 500 }
    );
  }
} 