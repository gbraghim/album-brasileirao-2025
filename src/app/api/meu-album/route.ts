import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Iniciando GET /api/meu-album');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.log('Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário
    console.log('Buscando usuário com email:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('Usuário encontrado:', user);

    if (!user) {
      console.log('Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar as figurinhas do usuário
    console.log('Buscando figurinhas do usuário');
    const userFigurinhas = await prisma.userFigurinha.findMany({
      where: { userId: user.id },
      include: {
        figurinha: {
          include: {
            jogador: {
              select: {
                id: true,
                nome: true,
                numero: true,
                posicao: true,
                nacionalidade: true,
                foto: true,
                time: {
                  select: {
                    id: true,
                    nome: true,
                    escudo: true
                  }
                }
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
      try {
        if (!uf.figurinha?.jogador) {
          console.warn('Figurinha sem jogador:', uf);
          return;
        }
        if (!uf.figurinha.jogador.time) {
          console.warn('Jogador sem time:', uf.figurinha.jogador);
          return;
        }

        const jogador = uf.figurinha.jogador;
        const jogadorId = jogador.id;

        if (!jogadoresMap.has(jogadorId)) {
          jogadoresMap.set(jogadorId, {
            id: jogadorId,
            nome: jogador.nome,
            numero: jogador.numero || 0,
            posicao: jogador.posicao || '',
            nacionalidade: jogador.nacionalidade || '',
            time: {
              id: jogador.time.id,
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
      } catch (error) {
        console.error('Erro ao processar figurinha:', uf, error);
      }
    });

    // Converter o Map para array e ordenar por nome do jogador
    const jogadores = Array.from(jogadoresMap.values()).sort((a, b) => 
      a.nome.localeCompare(b.nome)
    );
    console.log('Jogadores processados:', jogadores);

    return NextResponse.json({ jogadores });
  } catch (error) {
    console.error('Erro detalhado ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 