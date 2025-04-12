import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId, tipo } = await req.json();

    if (!trocaId || !tipo) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const troca = await prisma.troca.findUnique({
      where: { id: trocaId },
      include: {
        usuarioEnvia: true,
        usuarioRecebe: true,
        figurinhaOferta: {
          include: {
            jogador: true
          }
        }
      },
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    let mensagem = '';
    let usuarioId = '';

    switch (tipo) {
      case 'PROPOSTA_TROCA':
        mensagem = `${session.user.name} quer trocar a figurinha ${troca.figurinhaOferta.jogador.nome} #${troca.figurinhaOferta.jogador.numero}`;
        usuarioId = troca.usuarioEnviaId;
        break;
      case 'TROCA_ACEITA':
        mensagem = `${session.user.name} aceitou sua proposta de troca da figurinha ${troca.figurinhaOferta.jogador.nome}`;
        usuarioId = troca.usuarioEnviaId;
        break;
      case 'TROCA_RECUSADA':
        mensagem = `${session.user.name} recusou sua proposta de troca da figurinha ${troca.figurinhaOferta.jogador.nome}`;
        usuarioId = troca.usuarioEnviaId;
        break;
      default:
        return NextResponse.json({ error: 'Tipo de notificação inválido' }, { status: 400 });
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        tipo,
        mensagem,
        usuarioId,
        trocaId,
      },
    });

    return NextResponse.json(notificacao);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json({ error: 'Erro ao criar notificação' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: session.user.id,
      },
      include: {
        troca: {
          include: {
            figurinhaOferta: {
              include: {
                jogador: true,
              },
            },
            usuarioEnvia: true,
            usuarioRecebe: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 });
  }
} 