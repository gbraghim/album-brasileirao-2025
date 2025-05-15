import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    console.log('1. ID da troca recebido:', id);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('2. Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { status } = await req.json();
    console.log('3. Status recebido:', status);

    if (!status || !['ACEITA', 'RECUSADA'].includes(status)) {
      console.log('4. Status inválido:', status);
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const troca = await prisma.troca.findUnique({
      where: { id },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        }
      }
    });
    console.log('5. Troca encontrada:', troca?.id);

    if (!troca) {
      console.log('6. Troca não encontrada');
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    // Atualiza o status da troca
    const trocaAtualizada = await prisma.troca.update({
      where: { id },
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
    console.log('7. Troca atualizada:', trocaAtualizada.id);

    // Cria uma notificação para o usuário que propôs a troca
    await prisma.notificacao.create({
      data: {
        tipo: status === 'ACEITA' ? 'TROCA_ACEITA' : 'TROCA_RECUSADA',
        mensagem: status === 'ACEITA'
          ? `${session.user.name} aceitou sua proposta de troca da figurinha ${troca.figurinhaOferta.jogador?.nome || 'desconhecido'}`
          : `${session.user.name} recusou sua proposta de troca da figurinha ${troca.figurinhaOferta.jogador?.nome || 'desconhecido'}`,
        usuarioId: troca.usuarioEnviaId,
        trocaId: troca.id
      }
    });
    console.log('8. Notificação criada');

    return NextResponse.json(trocaAtualizada);
  } catch (error) {
    console.error('Erro ao responder troca:', error);
    return NextResponse.json(
      { error: 'Erro ao responder troca' },
      { status: 500 }
    );
  }
} 