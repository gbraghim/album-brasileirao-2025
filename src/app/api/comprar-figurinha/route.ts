import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { jogadorId, raridade } = await request.json();

    if (!jogadorId || !raridade) {
      return NextResponse.json(
        { error: 'Jogador e raridade são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar o jogador para validar a raridade
    const jogador = await prisma.jogador.findUnique({
      where: { id: jogadorId },
      select: {
        id: true,
        nome: true,
        raridade: true,
        time: {
          select: {
            nome: true
          }
        }
      }
    });

    if (!jogador) {
      return NextResponse.json(
        { error: 'Jogador não encontrado' },
        { status: 404 }
      );
    }

    if (jogador.raridade !== raridade) {
      return NextResponse.json(
        { error: 'Raridade do jogador não corresponde' },
        { status: 400 }
      );
    }

    // Buscar o produto da figurinha para obter o preço
    const produto = await prisma.produto_figurinha.findFirst({
      where: {
        raridade,
        ativo: true
      }
    });

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado para esta raridade' },
        { status: 404 }
      );
    }

    // Criar sessão de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Figurinha ${jogador.nome} - ${jogador.time.nome}`,
              description: `Figurinha ${raridade} do jogador ${jogador.nome}`,
            },
            unit_amount: produto.valor_centavos,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pacotes?success=true&jogadorId=${jogadorId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pacotes?canceled=true`,
      metadata: {
        userId: session.user.id,
        jogadorId,
        tipo: 'figurinha_especifica'
      },
    });

    await prisma.notificacao.create({
      data: {
        usuarioId: session.user.id,
        tipo: 'TROCA_RECEBIDA',
        tipoNovo: 'FIGURINHA_NOVA',
        mensagem: `🎉 Parabéns! Você acabou de adquirir a figurinha do ${jogador.nome}! Ela já está no seu álbum!`,
        lida: false,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Erro ao processar compra:', error);
    return NextResponse.json(
      { error: 'Erro ao processar compra' },
      { status: 500 }
    );
  }
} 