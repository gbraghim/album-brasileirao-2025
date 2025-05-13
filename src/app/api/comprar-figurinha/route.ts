import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
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

    const body = await request.json();
    const { jogadorId, raridade } = body;

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

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Configuração do Stripe inválida' },
        { status: 500 }
      );
    }

    if (!produto.stripe_price_id) {
      return NextResponse.json(
        { error: 'Preço do produto não configurado' },
        { status: 500 }
      );
    }

    // Usar a URL base da aplicação
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ebrasileirao.fun';

    try {
      // Criar sessão de checkout usando o stripe_price_id
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: produto.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/pacotes?success=true&jogadorId=${jogadorId}`,
        cancel_url: `${baseUrl}/pacotes?canceled=true`,
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
    } catch (stripeError) {
      if (stripeError instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          { 
            error: 'Erro ao criar sessão do Stripe',
            details: {
              type: stripeError.type,
              code: stripeError.code,
              message: stripeError.message
            }
          },
          { status: 500 }
        );
      }
      throw stripeError;
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Erro ao processar compra',
        details: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 