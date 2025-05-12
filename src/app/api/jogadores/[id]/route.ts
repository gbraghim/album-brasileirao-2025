import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const jogador = await prisma.jogador.findUnique({
      where: { id: context.params.id },
      select: {
        id: true,
        nome: true,
        raridade: true,
        time: {
          select: {
            nome: true
          }
        }
      }
    });

    if (!jogador) {
      return NextResponse.json(
        { error: 'Jogador não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(jogador);
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar jogador' },
      { status: 500 }
    );
  }
} 