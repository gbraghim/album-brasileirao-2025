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

    // Criar um Map para armazenar jogadores únicos com suas quantidades
    const jogadoresMap = new Map<string, any>();

    // Processar as figurinhas e agrupar por jogador
    userFigurinhas.forEach((uf) => {
      const jogadorId = uf.figurinha.jogador.id;
      if (!jogadoresMap.has(jogadorId)) {
        jogadoresMap.set(jogadorId, {
          id: jogadorId,
          nome: uf.figurinha.jogador.nome,
          numero: uf.figurinha.jogador.numero,
          posicao: uf.figurinha.jogador.posicao,
          idade: uf.figurinha.jogador.idade,
          nacionalidade: uf.figurinha.jogador.nacionalidade,
          foto: uf.figurinha.jogador.foto,
          quantidade: uf.quantidade,
          time: {
            nome: uf.figurinha.jogador.time.nome,
            escudo: uf.figurinha.jogador.time.escudo || ''
          }
        });
      } else {
        // Se o jogador já existe, somar a quantidade
        const jogador = jogadoresMap.get(jogadorId);
        jogador.quantidade += uf.quantidade;
        jogadoresMap.set(jogadorId, jogador);
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