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
    const pacote = await prisma.pacote.findFirst({
      where: { 
        id: pacoteId,
        userId: user.id,
        aberto: false
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
      return NextResponse.json({ error: 'Pacote não encontrado ou já foi aberto' }, { status: 404 });
    }

    // Marca o pacote como aberto
    await prisma.pacote.update({
      where: { id: pacoteId },
      data: { aberto: true }
    });

    // Adiciona as figurinhas ao álbum do usuário
    for (const figurinha of pacote.figurinhas) {
      const userFigurinha = await prisma.userFigurinha.findUnique({
        where: {
          userId_figurinhaId: {
            userId: user.id,
            figurinhaId: figurinha.id
          }
        }
      });

      if (userFigurinha) {
        await prisma.userFigurinha.update({
          where: {
            userId_figurinhaId: {
              userId: user.id,
              figurinhaId: figurinha.id
            }
          },
          data: {
            quantidade: userFigurinha.quantidade + 1
          }
        });
      } else {
        await prisma.userFigurinha.create({
          data: {
            userId: user.id,
            figurinhaId: figurinha.id,
            quantidade: 1
          }
        });
      }
    }

    return NextResponse.json({ 
      figurinhas: pacote.figurinhas.map(f => ({
        ...f,
        jogador: {
          ...f.jogador,
          time: f.jogador.time
        }
      }))
    });
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 