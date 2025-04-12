import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar figurinhas do usuário disponíveis para troca
    const minhasTrocas = await prisma.trocaFigurinha.findMany({
      where: {
        usuario: {
          email: session.user.email
        },
        status: 'DISPONIVEL'
      },
      include: {
        figurinha: {
          include: {
            jogador: true
          }
        }
      }
    });

    // Buscar figurinhas de outros usuários disponíveis para troca
    const outrasTrocas = await prisma.trocaFigurinha.findMany({
      where: {
        usuario: {
          email: {
            not: session.user.email
          }
        },
        status: 'DISPONIVEL'
      },
      include: {
        figurinha: {
          include: {
            jogador: true
          }
        },
        usuario: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      minhasTrocas,
      outrasTrocas
    });
  } catch (error) {
    console.error('Erro ao buscar figurinhas para troca:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar figurinhas para troca' },
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

    const { figurinhaId } = await request.json();

    // Verificar se a figurinha pertence ao usuário
    const usuarioFigurinha = await prisma.usuarioFigurinha.findFirst({
      where: {
        usuario: {
          email: session.user.email
        },
        figurinhaId
      }
    });

    if (!usuarioFigurinha) {
      return NextResponse.json(
        { error: 'Figurinha não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a figurinha já está disponível para troca
    const trocaExistente = await prisma.trocaFigurinha.findFirst({
      where: {
        usuario: {
          email: session.user.email
        },
        figurinhaId,
        status: 'DISPONIVEL'
      }
    });

    if (trocaExistente) {
      return NextResponse.json(
        { error: 'Figurinha já está disponível para troca' },
        { status: 400 }
      );
    }

    // Adicionar figurinha à área de trocas
    const troca = await prisma.trocaFigurinha.create({
      data: {
        usuario: {
          connect: {
            email: session.user.email
          }
        },
        figurinha: {
          connect: {
            id: figurinhaId
          }
        }
      },
      include: {
        figurinha: {
          include: {
            jogador: true
          }
        }
      }
    });

    return NextResponse.json(troca);
  } catch (error) {
    console.error('Erro ao adicionar figurinha para troca:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar figurinha para troca' },
      { status: 500 }
    );
  }
} 