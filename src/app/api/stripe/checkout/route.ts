import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { pacoteId, userId } = await req.json();
  if (!pacoteId || !userId) return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });

  const pacote = await prisma.pacotePreco.findUnique({ where: { id: pacoteId, ativo: true } });
  if (!pacote) return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: pacote.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pacotes?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pacotes?canceled=1`,
      metadata: {
        userId,
        pacoteId,
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 });
  }
} 