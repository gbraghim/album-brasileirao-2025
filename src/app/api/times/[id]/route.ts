import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const time = await prisma.time.findUnique({
      where: {
        id: params.id,
      },
      include: {
        jogadores: {
          orderBy: {
            numero: 'asc',
          },
        },
      },
    });

    if (!time) {
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(time);
  } catch (error) {
    console.error('Erro ao buscar time:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar time' },
      { status: 500 }
    );
  }
} 