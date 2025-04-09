import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Jogador } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pacotes: {
          include: {
            figurinhas: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user.pacotes);
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error);
    return NextResponse.json({ error: 'Erro ao buscar pacotes' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pacotes: {
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.pacotes.length > 0) {
      return NextResponse.json({ error: 'Você já recebeu seu pacote diário hoje' }, { status: 400 });
    }

    // Buscar jogadores aleatórios
    const jogadores = await prisma.jogador.findMany({
      take: 5,
      orderBy: {
        id: 'asc'
      }
    });

    // Criar pacote com figurinhas
    const pacote = await prisma.pacote.create({
      data: {
        userId: user.id,
        tipo: 'DIARIO',
        figurinhas: {
          create: jogadores.map((jogador: Jogador) => ({
            jogadorId: jogador.id
          }))
        }
      },
      include: {
        figurinhas: true
      }
    });

    return NextResponse.json(pacote);
  } catch (error) {
    console.error('Erro ao gerar pacote:', error);
    return NextResponse.json({ error: 'Erro ao gerar pacote' }, { status: 500 });
  }
} 