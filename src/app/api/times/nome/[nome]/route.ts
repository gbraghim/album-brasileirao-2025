import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { nome: string } }
) {
  try {
    // Buscar o time pelo nome exato (considerando maiúsculas e minúsculas)
    let time = await prisma.time.findFirst({
      where: {
        nome: {
          equals: params.nome,
          mode: 'insensitive', // Case insensitive
        },
      },
      include: {
        jogadores: {
          orderBy: {
            numero: 'asc',
          },
        },
      },
    });

    // Se não encontrar com o nome exato, tentar buscar pelo nome que contenha o termo
    if (!time) {
      time = await prisma.time.findFirst({
        where: {
          nome: {
            contains: params.nome,
            mode: 'insensitive', // Case insensitive
          },
        },
        include: {
          jogadores: {
            orderBy: {
              numero: 'asc',
            },
          },
        },
      });
    }

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