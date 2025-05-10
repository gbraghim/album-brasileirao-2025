import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TrocaStatus } from '@prisma/client';

type TrocaInclude = {
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
};

const trocaInclude: TrocaInclude = {
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
};

export async function POST(request: Request) {
  try {
    console.log('1. Iniciando POST /api/trocas/responder');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('2. Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId, aceitar } = await request.json();
    console.log('3. Dados recebidos:', { trocaId, aceitar });

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('4. Usuário autenticado:', usuario?.id, usuario?.name);

    if (!usuario) {
      console.log('5. Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar a troca com todas as informações necessárias
    const troca = await prisma.troca.findUnique({
      where: { 
        id: trocaId,
        status: TrocaStatus.PENDENTE
      },
      include: trocaInclude
    });
    console.log('6. Troca encontrada:', troca?.id, troca?.status);

    if (!troca) {
      console.log('7. Troca não encontrada ou não está mais pendente');
      return NextResponse.json({ error: 'Troca não encontrada ou não está mais pendente' }, { status: 404 });
    }

    // Verificar se o usuário é o destinatário da troca
    if (troca.usuarioRecebeId !== usuario.id) {
      console.log('8. Usuário não tem permissão para responder a troca');
      return NextResponse.json({ error: 'Você não tem permissão para responder a esta troca' }, { status: 403 });
    }

    if (aceitar) {
      console.log('9. Aceitando troca...');
      // Atualizar o status da troca para ACEITA
      const trocaAtualizada = await prisma.troca.update({
        where: { id: trocaId },
        data: { status: TrocaStatus.ACEITA },
        include: trocaInclude
      });
      console.log('10. Troca atualizada para ACEITA:', trocaAtualizada.id);

      // Cancelar todas as outras propostas pendentes que envolvam as duas figurinhas
      const ofertaId = troca.figurinhaOfertaId || undefined;
      const solicitadaId = troca.figurinhaSolicitadaId || undefined;
      const orArray = [];
      if (ofertaId) {
        orArray.push({ figurinhaOfertaId: ofertaId });
        orArray.push({ figurinhaSolicitadaId: ofertaId });
      }
      if (solicitadaId) {
        orArray.push({ figurinhaOfertaId: solicitadaId });
        orArray.push({ figurinhaSolicitadaId: solicitadaId });
      }
      if (orArray.length > 0) {
        await prisma.troca.updateMany({
          where: {
            id: { not: trocaId },
            status: TrocaStatus.PENDENTE,
            OR: orArray
          },
          data: { status: TrocaStatus.CANCELADA }
        });
      }

      // Criar notificação para o usuário que enviou a proposta
      try {
        const notificacao = await prisma.notificacao.create({
          data: {
            usuarioId: troca.usuarioEnviaId,
            tipo: 'TROCA_ACEITA',
            mensagem: `Sua proposta de troca pela figurinha ${troca.figurinhaOferta.jogador?.nome || 'desconhecido'} foi aceita por ${usuario.name}!`,
            lida: false,
            trocaId: trocaId
          }
        });
        console.log('11. Notificação de troca aceita criada:', notificacao.id);
      } catch (err) {
        console.error('Erro ao criar notificação de troca aceita:', err);
      }

      return NextResponse.json(trocaAtualizada);
    } else {
      console.log('9. Recusando troca...');
      // Atualizar o status da troca para RECUSADA
      const trocaAtualizada = await prisma.troca.update({
        where: { id: trocaId },
        data: { status: TrocaStatus.RECUSADA },
        include: trocaInclude
      });
      console.log('10. Troca atualizada para RECUSADA:', trocaAtualizada.id);

      // Criar notificação para o usuário que enviou a proposta
      try {
        const notificacao = await prisma.notificacao.create({
          data: {
            usuarioId: troca.usuarioEnviaId,
            tipo: 'TROCA_RECUSADA',
            mensagem: `Sua proposta de troca pela figurinha ${troca.figurinhaOferta.jogador?.nome || 'desconhecido'} foi recusada por ${usuario.name}.`,
            lida: false,
            trocaId: trocaId
          }
        });
        console.log('11. Notificação de troca recusada criada:', notificacao.id);
      } catch (err) {
        console.error('Erro ao criar notificação de troca recusada:', err);
      }

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