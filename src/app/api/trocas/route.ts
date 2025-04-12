import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca trocas que o usuário ofereceu
    const minhasTrocas = await prisma.troca.findMany({
      where: {
        usuarioEnviaId: session.user.id,
        status: 'PENDENTE'
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        },
        usuarioEnvia: true
      }
    });

    // Busca trocas disponíveis de outros usuários
    const trocasDisponiveis = await prisma.troca.findMany({
      where: {
        usuarioEnviaId: {
          not: session.user.id
        },
        status: 'PENDENTE',
        usuarioRecebeId: null
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        },
        usuarioEnvia: true
      }
    });

    // Busca propostas recebidas (trocas onde o usuário é o dono da figurinha)
    const propostasRecebidas = await prisma.troca.findMany({
      where: {
        status: 'PENDENTE',
        figurinhaOferta: {
          usuarios: {
            some: {
              userId: session.user.id
            }
          }
        },
        usuarioEnviaId: {
          not: session.user.id
        },
        usuarioRecebeId: null
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        },
        usuarioEnvia: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      minhasTrocas,
      trocasDisponiveis,
      propostasRecebidas
    });
  } catch (error) {
    console.error('Erro ao buscar trocas:', error);
    return NextResponse.json({ error: 'Erro ao buscar trocas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { figurinhaId } = await req.json();

    // Verifica se o usuário tem a figurinha e se está repetida
    const userFigurinha = await prisma.userFigurinha.findUnique({
      where: {
        userId_figurinhaId: {
          userId: session.user.id,
          figurinhaId
        }
      }
    });

    if (!userFigurinha || userFigurinha.quantidade <= 1) {
      return NextResponse.json(
        { error: 'Figurinha não encontrada ou não está disponível para troca' },
        { status: 404 }
      );
    }

    // Cria a troca
    const troca = await prisma.troca.create({
      data: {
        figurinhaOfertaId: figurinhaId,
        usuarioEnviaId: session.user.id,
        status: 'PENDENTE'
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        },
        usuarioEnvia: true
      }
    });

    return NextResponse.json(troca);
  } catch (error) {
    console.error('Erro ao criar troca:', error);
    return NextResponse.json({ error: 'Erro ao criar troca' }, { status: 500 });
  }
} 