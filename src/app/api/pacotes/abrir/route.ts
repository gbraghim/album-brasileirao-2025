import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const FIGURINHAS_POR_PACOTE = 4;

export async function POST(request: Request) {
  try {
    console.log('Iniciando abertura de pacote...');
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log('Usuário não autenticado');
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log('Buscando usuário...');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('Usuário não encontrado');
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const { pacoteId } = await request.json();

    if (!pacoteId) {
      console.log('ID do pacote não fornecido');
      return NextResponse.json(
        { message: 'ID do pacote é obrigatório' },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      console.log('Verificando pacote...');
      // Verificar se o pacote pertence ao usuário
      const pacote = await tx.pacote.findFirst({
        where: {
          id: pacoteId,
          userId: user.id,
          aberto: false
        }
      });

      if (!pacote) {
        console.log('Pacote não encontrado ou já aberto');
        throw new Error('Pacote não encontrado ou já aberto');
      }

      console.log('Buscando jogadores...');
      // Buscar todos os IDs dos jogadores
      const jogadoresIds = await tx.jogador.findMany({
        select: { id: true }
      });

      if (jogadoresIds.length === 0) {
        console.log('Nenhum jogador encontrado');
        throw new Error('Nenhum jogador encontrado');
      }

      console.log('Selecionando jogadores aleatórios...');
      // Selecionar 4 jogadores aleatórios
      const jogadoresSelecionados = [];
      for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
        const randomIndex = Math.floor(Math.random() * jogadoresIds.length);
        const jogadorId = jogadoresIds[randomIndex].id;
        jogadoresSelecionados.push(jogadorId);
      }

      console.log('Criando figurinhas...');
      // Criar as figurinhas no pacote e a relação com o usuário
      const figurinhasCriadas = [];
      for (const jogadorId of jogadoresSelecionados) {
        // Verificar se o usuário já tem figurinhas deste jogador
        const figurinhaExistente = await tx.userFigurinha.findFirst({
          where: {
            userId: user.id,
            figurinha: {
              jogadorId: jogadorId
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

        // Criar a figurinha
        const figurinha = await tx.figurinha.create({
          data: {
            pacoteId: pacote.id,
            jogadorId: jogadorId
          },
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
        });

        if (!figurinha.jogador) {
          console.warn('Figurinha criada sem jogador:', figurinha);
          continue;
        }
        if (!figurinha.jogador.time) {
          console.warn('Jogador sem time:', figurinha.jogador);
          continue;
        }

        // Criar ou atualizar a relação com o usuário
        const userFigurinha = await tx.userFigurinha.upsert({
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

        figurinhasCriadas.push({
          id: figurinha.id,
          jogador: {
            id: figurinha.jogador.id,
            nome: figurinha.jogador.nome,
            numero: figurinha.jogador.numero || 0,
            posicao: figurinha.jogador.posicao || '',
            nacionalidade: figurinha.jogador.nacionalidade || '',
            foto: figurinha.jogador.foto || '',
            time: {
              id: figurinha.jogador.time.id,
              nome: figurinha.jogador.time.nome,
              escudo: figurinha.jogador.time.escudo || ''
            }
          },
          quantidadeAtual: figurinhaExistente ? figurinhaExistente.quantidade + 1 : 1
        });
      }

      console.log('Atualizando pacote...');
      // Atualizar o pacote como aberto
      await tx.pacote.update({
        where: { id: pacoteId },
        data: { aberto: true }
      });

      console.log('Pacote aberto com sucesso');
      return NextResponse.json({
        message: 'Pacote aberto com sucesso',
        figurinhas: figurinhasCriadas
      });
    });
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Erro do Prisma:', error.code, error.message);
      return NextResponse.json(
        { message: 'Erro ao abrir pacote', error: error.message },
        { status: 500 }
      );
    }
    if (error instanceof Error) {
      if (error.message === 'Pacote não encontrado ou já aberto') {
        return NextResponse.json(
          { message: error.message },
          { status: 404 }
        );
      }
      if (error.message === 'Nenhum jogador encontrado') {
        return NextResponse.json(
          { message: error.message },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { message: 'Erro ao abrir pacote', error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 