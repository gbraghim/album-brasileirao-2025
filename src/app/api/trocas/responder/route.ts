import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const trocaInclude = {
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
  },
  usuarioEnvia: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  usuarioRecebe: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.TrocaInclude;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId, aceitar } = await request.json();

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar a troca com todas as informações necessárias
    const troca = await prisma.troca.findUnique({
      where: { 
        id: trocaId,
        status: 'PENDENTE'
      },
      include: trocaInclude
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada ou não está mais pendente' }, { status: 404 });
    }

    // Verificar se o usuário é o destinatário da troca
    if (troca.usuarioRecebeId !== usuario.id) {
      return NextResponse.json({ error: 'Você não tem permissão para responder a esta troca' }, { status: 403 });
    }

    if (aceitar) {
      // Atualizar o status da troca para ACEITA
      const trocaAtualizada = await prisma.troca.update({
        where: { id: trocaId },
        data: { status: 'ACEITA' },
        include: trocaInclude
      });

      // Criar notificação para o usuário que enviou a proposta
      await prisma.notificacao.create({
        data: {
          usuarioId: troca.usuarioEnviaId,
          tipo: 'PROPOSTA_ACEITA',
          mensagem: `${usuario.name} aceitou sua proposta de troca do ${troca.figurinhaOferta.jogador.nome}!`,
          lida: false,
          trocaId: trocaId
        }
      });

      return NextResponse.json(trocaAtualizada);
    } else {
      // Atualizar o status da troca para RECUSADA
      const trocaAtualizada = await prisma.troca.update({
        where: { id: trocaId },
        data: { status: 'RECUSADA' },
        include: trocaInclude
      });

      // Criar notificação para o usuário que enviou a proposta
      await prisma.notificacao.create({
        data: {
          usuarioId: troca.usuarioEnviaId,
          tipo: 'PROPOSTA_RECUSADA',
          mensagem: `${usuario.name} recusou sua proposta de troca do ${troca.figurinhaOferta.jogador.nome}.`,
          lida: false,
          trocaId: trocaId
        }
      });

      return NextResponse.json(trocaAtualizada);
    }
  } catch (error) {
    console.error('Erro ao responder proposta de troca:', error);
    return NextResponse.json(
      { error: 'Erro ao responder proposta de troca' },
      { status: 500 }
    );
  }
} 