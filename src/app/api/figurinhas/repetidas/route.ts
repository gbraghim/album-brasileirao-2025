import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Busca todas as figurinhas do usuário
    const figurinhas = await prisma.figurinha.findMany({
      where: {
        pacote: {
          user: {
            email: session.user.email
          }
        }
      },
      include: {
        jogador: true
      }
    });

    // Conta quantas vezes cada jogador aparece
    const contagemJogadores = figurinhas.reduce((acc, figurinha) => {
      const jogadorId = figurinha.jogadorId;
      if (!acc[jogadorId]) {
        acc[jogadorId] = {
          jogadorId,
          nome: figurinha.jogador.nome,
          posicao: figurinha.jogador.posicao,
          quantidade: 0
        };
      }
      acc[jogadorId].quantidade++;
      return acc;
    }, {} as Record<string, any>);

    // Filtra apenas as figurinhas que aparecem mais de uma vez
    const figurinhasRepetidas = Object.values(contagemJogadores)
      .filter(fig => fig.quantidade > 1)
      .sort((a, b) => b.quantidade - a.quantidade);

    return NextResponse.json(figurinhasRepetidas);
  } catch (error) {
    console.error('Erro ao buscar figurinhas repetidas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar figurinhas repetidas' },
      { status: 500 }
    );
  }
} 