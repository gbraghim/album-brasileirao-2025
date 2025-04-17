import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const FIGURINHAS_POR_PACOTE = 4;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { pacoteId } = await request.json();

    if (!pacoteId) {
      return NextResponse.json(
        { message: 'ID do pacote é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o pacote pertence ao usuário
    const pacote = await prisma.pacote.findFirst({
      where: {
        id: pacoteId,
        userId: session.user.id,
        aberto: false
      }
    });

    if (!pacote) {
      return NextResponse.json(
        { message: 'Pacote não encontrado ou já aberto' },
        { status: 404 }
      );
    }

    // Buscar todos os IDs dos jogadores
    const jogadoresIds = await prisma.jogador.findMany({
      select: { id: true }
    });

    if (jogadoresIds.length === 0) {
      return NextResponse.json(
        { message: 'Nenhum jogador encontrado' },
        { status: 404 }
      );
    }

    // Selecionar 4 jogadores aleatórios
    const jogadoresSelecionados = [];
    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
      const randomIndex = Math.floor(Math.random() * jogadoresIds.length);
      const jogadorId = jogadoresIds[randomIndex].id;
      jogadoresSelecionados.push(jogadorId);
    }

    // Criar as figurinhas no pacote e a relação com o usuário
    const figurinhasCriadas = [];
    for (const jogadorId of jogadoresSelecionados) {
      // Criar a figurinha
      const figurinha = await prisma.figurinha.create({
        data: {
          pacoteId: pacote.id,
          jogadorId: jogadorId
        },
        include: {
          jogador: {
            include: {
              time: true
            }
          }
        }
      });

      // Criar ou atualizar a relação com o usuário
      await prisma.userFigurinha.upsert({
        where: {
          userId_figurinhaId: {
            userId: session.user.id,
            figurinhaId: figurinha.id
          }
        },
        update: {
          quantidade: {
            increment: 1
          }
        },
        create: {
          userId: session.user.id,
          figurinhaId: figurinha.id,
          quantidade: 1
        }
      });

      figurinhasCriadas.push(figurinha);
    }

    // Atualizar o pacote como aberto
    await prisma.pacote.update({
      where: { id: pacoteId },
      data: { aberto: true }
    });

    return NextResponse.json({
      message: 'Pacote aberto com sucesso',
      figurinhas: figurinhasCriadas
    });
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    return NextResponse.json(
      { message: 'Erro ao abrir pacote' },
      { status: 500 }
    );
  }
} 