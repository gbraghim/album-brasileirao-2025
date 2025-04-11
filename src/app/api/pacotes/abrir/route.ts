import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { pacoteId } = await request.json();
    
    if (!pacoteId) {
      return NextResponse.json({ error: 'ID do pacote não fornecido' }, { status: 400 });
    }

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Busca o pacote e suas figurinhas
    const pacote = await prisma.pacote.findUnique({
      where: { 
        id: pacoteId,
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

    if (pacote.aberto) {
      return NextResponse.json({ error: 'Pacote já foi aberto' }, { status: 400 });
    }

    // Marca o pacote como aberto
    await prisma.pacote.update({
      where: { id: pacoteId },
      data: { aberto: true }
    });

    // Adiciona as figurinhas ao álbum do usuário
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

    return NextResponse.json({ figurinhas: pacote.figurinhas });
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 