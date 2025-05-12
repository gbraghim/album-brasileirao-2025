import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });

export async function POST(req: NextRequest) {
  console.log('[STRIPE][INÍCIO] Recebendo requisição de compra de pacote');
  let pacoteId, userId;
  try {
    const body = await req.json();
    pacoteId = body.pacoteId;
    userId = body.userId;
    console.log('[STRIPE][BODY]', body);
  } catch (err) {
    console.error('[STRIPE][ERRO][JSON]', err);
    return NextResponse.json({ error: 'Erro ao ler o corpo da requisição' }, { status: 400 });
  }

  if (!pacoteId || !userId) {
    console.warn('[STRIPE][ERRO] Dados insuficientes', { pacoteId, userId });
    return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
  }

  let pacote;
  try {
    pacote = await prisma.pacotePreco.findUnique({ where: { id: pacoteId, ativo: true } });
    console.log('[STRIPE][PACOTE]', pacote);
  } catch (err) {
    console.error('[STRIPE][ERRO][PRISMA]', err);
    return NextResponse.json({ error: 'Erro ao buscar pacote' }, { status: 500 });
  }

  if (!pacote) {
    console.warn('[STRIPE][ERRO] Pacote não encontrado', { pacoteId });
    return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });
  }

  try {
    console.log('[STRIPE][CRIANDO SESSÃO]', { stripePriceId: pacote.stripePriceId, userId, pacoteId });
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
        tipo: 'pacote',
      },
    });
    console.log('[STRIPE][SESSÃO CRIADA]', session.url);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[STRIPE][ERRO][STRIPE]', err);
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 });
  }
} 