import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type TrocaComRelacoes = {
  id: string;
  status: string;
  figurinhaOferta: {
    id: string;
    jogador: {
      id: string;
      nome: string;
      posicao: string | null;
      numero: number | null;
      foto: string | null;
      time: {
        id: string;
        nome: string;
        escudo: string | null;
      };
    };
  };
  usuarioEnvia: {
    name: string | null;
    email: string;
  };
};

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

    // Buscar trocas disponíveis (não enviadas pelo usuário atual)
    const trocasDisponiveis = await prisma.troca.findMany({
      where: {
        NOT: {
          usuarioEnviaId: user.id
        },
        status: 'PENDENTE'
      },
      include: {
        usuarioEnvia: {
          select: {
            name: true,
            email: true
          }
        },
        figurinhaOferta: {
          include: {
            jogador: {
              select: {
                id: true,
                nome: true,
                posicao: true,
                numero: true,
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

    // Buscar trocas do usuário atual
    const minhasTrocas = await prisma.troca.findMany({
      where: {
        usuarioEnviaId: user.id,
        status: 'PENDENTE'
      },
      include: {
        usuarioEnvia: {
          select: {
            name: true,
            email: true
          }
        },
        figurinhaOferta: {
          include: {
            jogador: {
              select: {
                id: true,
                nome: true,
                posicao: true,
                numero: true,
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

    const formatarTroca = (troca: any) => ({
      id: troca.id,
      status: troca.status,
      figurinha: {
        id: troca.figurinhaOferta.id,
        jogador: {
          id: troca.figurinhaOferta.jogador.id,
          nome: troca.figurinhaOferta.jogador.nome,
          posicao: troca.figurinhaOferta.jogador.posicao,
          numero: troca.figurinhaOferta.jogador.numero,
          time: {
            id: troca.figurinhaOferta.jogador.time.id,
            nome: troca.figurinhaOferta.jogador.time.nome,
            escudo: troca.figurinhaOferta.jogador.time.escudo
          }
        }
      },
      usuarioEnvia: troca.usuarioEnvia
    });

    return NextResponse.json({
      trocasDisponiveis: trocasDisponiveis.map(formatarTroca),
      minhasTrocas: minhasTrocas.map(formatarTroca)
    });
  } catch (error) {
    console.error('Erro ao buscar trocas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar trocas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { figurinhaId } = await request.json();

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário tem a figurinha repetida
    const usuarioFigurinha = await prisma.userFigurinha.findFirst({
      where: {
        userId: usuario.id,
        figurinhaId,
        quantidade: {
          gt: 1
        }
      }
    });

    if (!usuarioFigurinha) {
      return NextResponse.json(
        { error: 'Figurinha não encontrada ou não está disponível para troca' },
        { status: 404 }
      );
    }

    // Verificar se a figurinha já está em uma troca pendente
    const trocaExistente = await prisma.troca.findFirst({
      where: {
        usuarioEnviaId: usuario.id,
        figurinhaOfertaId: figurinhaId,
        status: 'PENDENTE'
      }
    });

    if (trocaExistente) {
      return NextResponse.json(
        { error: 'Figurinha já está disponível para troca' },
        { status: 400 }
      );
    }

    // Criar nova troca
    const novaTroca = await prisma.troca.create({
      data: {
        usuarioEnviaId: usuario.id,
        figurinhaOfertaId: figurinhaId,
        status: 'PENDENTE'
      },
      include: {
        usuarioEnvia: {
          select: {
            name: true,
            email: true
          }
        },
        figurinhaOferta: {
          include: {
            jogador: {
              select: {
                id: true,
                nome: true,
                posicao: true,
                numero: true,
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

    return NextResponse.json({
      id: novaTroca.id,
      figurinha: {
        id: novaTroca.figurinhaOferta.id,
        jogador: {
          id: novaTroca.figurinhaOferta.jogador.id,
          nome: novaTroca.figurinhaOferta.jogador.nome,
          posicao: novaTroca.figurinhaOferta.jogador.posicao,
          numero: novaTroca.figurinhaOferta.jogador.numero,
          foto: novaTroca.figurinhaOferta.jogador.foto,
          time: {
            id: novaTroca.figurinhaOferta.jogador.time.id,
            nome: novaTroca.figurinhaOferta.jogador.time.nome,
            escudo: novaTroca.figurinhaOferta.jogador.time.escudo
          }
        }
      },
      usuarioEnvia: novaTroca.usuarioEnvia
    });
  } catch (error) {
    console.error('Erro ao criar troca:', error);
    return NextResponse.json(
      { error: 'Erro ao criar troca' },
      { status: 500 }
    );
  }
} 