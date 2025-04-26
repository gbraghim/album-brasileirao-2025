import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log('Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('Email do usuário:', session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('Usuário não encontrado no banco');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('ID do usuário encontrado:', user.id);

    // Buscar todas as figurinhas do usuário com quantidade > 1
    const todasFigurinhas = await prisma.userFigurinha.findMany({
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

    console.log('Total de figurinhas encontradas:', todasFigurinhas.length);
    console.log('Detalhes das figurinhas:', todasFigurinhas.map(f => ({
      id: f.figurinha.id,
      jogador: f.figurinha.jogador?.nome,
      quantidade: f.quantidade
    })));

    // Formatar as figurinhas repetidas com todas as informações necessárias
    const figurinhasFormatadas = todasFigurinhas.map(uf => ({
      id: uf.figurinha.id,
      jogador: {
        id: uf.figurinha.jogador?.id || '',
        nome: uf.figurinha.jogador?.nome || '',
        posicao: uf.figurinha.jogador?.posicao || '',
        numero: uf.figurinha.jogador?.numero || 0,
        nacionalidade: uf.figurinha.jogador?.nacionalidade || '',
        foto: uf.figurinha.jogador?.foto || '',
        time: {
          id: uf.figurinha.jogador?.time?.id || '',
          nome: uf.figurinha.jogador?.time?.nome || '',
          escudo: uf.figurinha.jogador?.time?.escudo || ''
        }
      },
      quantidade: uf.quantidade,
      raridade: uf.figurinha.raridade === 'COMUM' ? 'Prata' : (uf.figurinha.raridade || 'Prata')
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