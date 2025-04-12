import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { status } = await req.json();

    if (!status || !['ACEITA', 'RECUSADA'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const troca = await prisma.troca.findUnique({
      where: { id: params.id },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        }
      }
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    // Atualiza o status da troca
    const trocaAtualizada = await prisma.troca.update({
      where: { id: params.id },
      data: { 
        status,
        usuarioRecebeId: session.user.id
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        }
      }
    });

    // Cria uma notificação para o usuário que propôs a troca
    await prisma.notificacao.create({
      data: {
        tipo: status === 'ACEITA' ? 'TROCA_ACEITA' : 'TROCA_RECUSADA',
        mensagem: status === 'ACEITA' 
          ? `${session.user.name} aceitou sua proposta de troca da figurinha ${troca.figurinhaOferta.jogador.nome}`
          : `${session.user.name} recusou sua proposta de troca da figurinha ${troca.figurinhaOferta.jogador.nome}`,
        usuarioId: troca.usuarioEnviaId,
        trocaId: troca.id
      }
    });

    return NextResponse.json(trocaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar troca:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar troca' },
      { status: 500 }
    );
  }
} 