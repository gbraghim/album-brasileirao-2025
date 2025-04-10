import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verificarPacotesDiarios } from '@/lib/pacotes';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verifica e cria pacotes diários
    await verificarPacotesDiarios(user.id);

    const pacotes = await prisma.pacote.findMany({
      where: {
        userId: user.id,
        aberto: false as const
      },
      include: {
        figurinhas: {
          include: {
            jogador: {
              include: {
                time: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(pacotes);
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pacotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar o pacote mais antigo não aberto
    const pacote = await prisma.pacote.findFirst({
      where: {
        userId: user.id,
        aberto: false as const
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!pacote) {
      return NextResponse.json({ error: 'Você não tem pacotes disponíveis' }, { status: 400 });
    }

    // Marcar o pacote como aberto
    const pacoteAberto = await prisma.pacote.update({
      where: { id: pacote.id },
      data: { aberto: true as const },
      include: {
        figurinhas: {
          include: {
            jogador: {
              include: {
                time: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(pacoteAberto);
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    return NextResponse.json({ error: 'Erro ao abrir pacote' }, { status: 500 });
  }
} 