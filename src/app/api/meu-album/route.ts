import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserFigurinha } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse('Usuário não encontrado', { status: 404 });
    }

    // Buscar as figurinhas do usuário
    const userFigurinhas = await prisma.userFigurinha.findMany({
      where: { userId: user.id },
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

    console.log('Figurinhas encontradas:', userFigurinhas);

    // Agrupar figurinhas por jogador
    const jogadoresMap = new Map();

    userFigurinhas.forEach((uf) => {
      const jogador = uf.figurinha.jogador;
      const jogadorId = jogador.id;

      if (!jogadoresMap.has(jogadorId)) {
        jogadoresMap.set(jogadorId, {
          id: jogadorId,
          nome: jogador.nome,
          numero: jogador.numero,
          posicao: jogador.posicao,
          idade: jogador.idade,
          nacionalidade: jogador.nacionalidade,
          foto: jogador.foto,
          time: {
            nome: jogador.time.nome,
            escudo: jogador.time.escudo || ''
          },
          figurinhas: [{
            id: uf.figurinha.id,
            quantidade: uf.quantidade
          }]
        });
      } else {
        const jogadorExistente = jogadoresMap.get(jogadorId);
        jogadorExistente.figurinhas.push({
          id: uf.figurinha.id,
          quantidade: uf.quantidade
        });
      }
    });

    // Converter o Map para array e ordenar por nome do jogador
    const jogadores = Array.from(jogadoresMap.values()).sort((a, b) => 
      a.nome.localeCompare(b.nome)
    );

    console.log('Jogadores processados:', jogadores);

    return NextResponse.json({ jogadores });
  } catch (error) {
    console.error('Erro ao carregar álbum:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
} 