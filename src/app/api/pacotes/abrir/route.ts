import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const FIGURINHAS_POR_PACOTE = 4;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário pelo email
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar o pacote mais antigo não aberto
    const pacote = await prisma.pacote.findFirst({
      where: {
        userId: usuario.id,
        aberto: false
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!pacote) {
      return NextResponse.json({ error: 'Nenhum pacote disponível' }, { status: 404 });
    }

    // Buscar todos os IDs dos jogadores
    const jogadoresIds = await prisma.jogador.findMany({
      select: { id: true }
    });

    if (jogadoresIds.length === 0) {
      return NextResponse.json({ error: 'Nenhum jogador encontrado' }, { status: 404 });
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
            userId: usuario.id,
            figurinhaId: figurinha.id
          }
        },
        update: {
          quantidade: {
            increment: 1
          }
        },
        create: {
          userId: usuario.id,
          figurinhaId: figurinha.id,
          quantidade: 1
        }
      });

      figurinhasCriadas.push(figurinha);
    }

    // Marcar o pacote como aberto
    await prisma.pacote.update({
      where: { id: pacote.id },
      data: { aberto: true }
    });

    return NextResponse.json({
      pacote: {
        ...pacote,
        aberto: true
      },
      figurinhas: figurinhasCriadas
    });
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    return NextResponse.json(
      { error: 'Erro ao abrir pacote' },
      { status: 500 }
    );
  }
} 