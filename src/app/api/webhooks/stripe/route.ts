import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Erro ao verificar assinatura do webhook:', err);
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { userId, tipo, produtoId } = session.metadata || {};

  if (!userId || !tipo) {
    throw new Error('Dados da sessão incompletos');
  }

  if (tipo === 'pacote') {
    // ... existing code for pacote ...
  } else if (tipo === 'figurinha_especifica') {
    if (!produtoId) {
      throw new Error('ID do produto não encontrado');
    }

    const produto = await prisma.produto_figurinha.findUnique({
      where: { id: produtoId }
    });

    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    await prisma.compra_figurinha.create({
      data: {
        user_id: userId,
        produto_id: produtoId,
        status: 'AGUARDANDO_ESCOLHA'
      }
    });
  }
} 