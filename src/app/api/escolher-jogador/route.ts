import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { compraId, jogadorId } = await request.json();

    if (!compraId || !jogadorId) {
      return NextResponse.json(
        { error: 'ID da compra e ID do jogador são obrigatórios' },
        { status: 400 }
      );
    }

    const compra = await prisma.compra_figurinha.findUnique({
      where: { id: compraId }
    });

    if (!compra) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      );
    }

    if (compra.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (compra.status !== 'AGUARDANDO_ESCOLHA') {
      return NextResponse.json(
        { error: 'Esta compra já foi processada' },
        { status: 400 }
      );
    }

    const jogador = await prisma.jogador.findUnique({
      where: { id: jogadorId },
      include: {
        time: true
      }
    });

    if (!jogador) {
      return NextResponse.json(
        { error: 'Jogador não encontrado' },
        { status: 404 }
      );
    }

    // Atualiza a compra com o jogador escolhido
    await prisma.compra_figurinha.update({
      where: { id: compraId },
      data: {
        jogador_id: jogadorId,
        time_id: jogador.timeId,
        status: 'CONCLUIDA'
      }
    });

    // Cria a figurinha para o usuário
    await prisma.userFigurinha.create({
      data: {
        userId: session.user.id,
        figurinhaId: jogadorId,
        quantidade: 1,
        nomeJogador: jogador.nome,
        nomeTime: jogador.time.nome
      }
    });

    // Atualiza o contador de figurinhas do usuário
    const raridade = jogador.raridade?.toLowerCase() || 'prata';
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        [`qtdFigurinhas${raridade.charAt(0).toUpperCase() + raridade.slice(1)}`]: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao escolher jogador:', error);
    return NextResponse.json(
      { error: 'Erro ao processar escolha do jogador' },
      { status: 500 }
    );
  }
} 