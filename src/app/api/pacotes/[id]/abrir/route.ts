import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Pacote, UserFigurinha } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/').pop() || '';
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const pacote = await prisma.pacote.findUnique({
      where: {
        id: id,
        userId: user.id
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
      }
    });

    if (!pacote) {
      return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });
    }

    // Atualizar quantidades das figurinhas do usuário
    for (const figurinha of pacote.figurinhas) {
      await prisma.userFigurinha.upsert({
        where: {
          userId_figurinhaId: {
            userId: user.id,
            figurinhaId: figurinha.id
          }
        },
        update: {
          quantidade: {
            increment: 1
          }
        },
        create: {
          userId: user.id,
          figurinhaId: figurinha.id,
          quantidade: 1
        }
      });
    }

    // Marcar o pacote como aberto em vez de deletá-lo
    await prisma.pacote.update({
      where: {
        id: pacote.id
      },
      data: {
        aberto: true
      }
    });

    return NextResponse.json({ figurinhas: pacote.figurinhas });
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 