import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { TipoPacote } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return new NextResponse('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return new NextResponse('Webhook signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const productId = session.metadata?.productId;

    if (!userId || !productId) {
      return new NextResponse('Missing metadata', { status: 400 });
    }

    const product = await prisma.produto.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Criar pacotes do tipo COMPRADO
    for (let i = 0; i < product.quantidadePacotes; i++) {
      await prisma.pacote.create({
        data: {
          userId,
          tipo: TipoPacote.COMPRADO,
          aberto: false
        }
      });
    }
  }

  return new NextResponse(null, { status: 200 });
} 