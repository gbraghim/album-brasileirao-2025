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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar todas as figurinhas do usuário que estão repetidas
    const figurinhasRepetidas = await prisma.userFigurinha.findMany({
      where: {
        userId: user.id,
        quantidade: {
          gt: 1
        }
      },
      include: {
        figurinha: {
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

    console.log('Figurinhas repetidas encontradas:', figurinhasRepetidas.length);

    // Formatar as figurinhas repetidas com todas as informações necessárias
    const figurinhasFormatadas = figurinhasRepetidas.map(uf => ({
      id: uf.figurinha.id,
      numero: uf.figurinha.jogador.numero,
      nome: uf.figurinha.jogador.nome,
      posicao: uf.figurinha.jogador.posicao,
      idade: uf.figurinha.jogador.idade,
      nacionalidade: uf.figurinha.jogador.nacionalidade,
      foto: uf.figurinha.jogador.foto,
      quantidade: uf.quantidade,
      time: {
        id: uf.figurinha.jogador.time.id,
        nome: uf.figurinha.jogador.time.nome,
        escudo: uf.figurinha.jogador.time.escudo
      }
    }));

    console.log('Figurinhas formatadas:', figurinhasFormatadas);

    return NextResponse.json(figurinhasFormatadas);
  } catch (error) {
    console.error('Erro ao buscar figurinhas repetidas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar figurinhas repetidas' },
      { status: 500 }
    );
  }
} 