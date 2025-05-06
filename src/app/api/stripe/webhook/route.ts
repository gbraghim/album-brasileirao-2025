import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  console.log('[WEBHOOK] Usando STRIPE_WEBHOOK_SECRET:', webhookSecret);
  console.log('📨 [WEBHOOK] Request recebido no endpoint!');
  try {
    const body = await req.text();
    console.log('📨 [WEBHOOK] Body recebido:', body);

    const signature = req.headers.get('stripe-signature');
    console.log('📨 [WEBHOOK] Signature:', signature);

    if (!signature) {
      console.error('⚠️ [WEBHOOK] Assinatura do webhook não encontrada');
      return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ [WEBHOOK] Evento validado:', event.type);
      console.log('✅ [WEBHOOK] Evento completo:', JSON.stringify(event, null, 2));
    } catch (err) {
      console.error('⚠️ [WEBHOOK] Erro ao validar assinatura do webhook:', err);
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💰 [WEBHOOK] Session:', session);
      const { userId, pacoteId } = session.metadata || {};
      console.log('💰 [WEBHOOK] userId:', userId, 'pacoteId:', pacoteId);

      // Validar se o usuário existe
      const usuario = await prisma.user.findUnique({
        where: { id: userId }
      });
      console.log('🔍 [WEBHOOK] Usuário encontrado:', usuario);

      if (!usuario) {
        console.error('❌ [WEBHOOK] Usuário não encontrado:', userId);
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      // Buscar o pacote para saber quantos pacotes devem ser adicionados
      console.log('🔍 [WEBHOOK] Buscando pacote no banco de dados:', pacoteId);
      const pacote = await prisma.pacotePreco.findUnique({
        where: { id: pacoteId }
      });
      console.log('🔍 [WEBHOOK] Pacote encontrado:', pacote);

      if (!pacote) {
        console.error('❌ [WEBHOOK] Pacote não encontrado:', pacoteId);
        return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });
      }

      const { quantidade } = pacote;
      console.log('📦 [WEBHOOK] Quantidade de pacotes a adicionar:', quantidade);

      // Criar os pacotes para o usuário em uma transação
      console.log('➕ [WEBHOOK] Criando pacotes para o usuário');
      await prisma.$transaction(async (tx) => {
        // Criar os pacotes
        const pacotesPromises = Array(quantidade).fill(null).map(() => 
          tx.pacote.create({
            data: {
              userId,
              aberto: false,
              tipo: 'COMPRADO'
            }
          })
        );

        await Promise.all(pacotesPromises);
        console.log('✅ [WEBHOOK] Pacotes criados com sucesso');

        // Criar notificação para o usuário
        console.log('📢 [WEBHOOK] Criando notificação para o usuário');
        await tx.notificacao.create({
          data: {
            usuarioId: userId,
            mensagem: `${quantidade} pacote${quantidade > 1 ? 's' : ''} ${quantidade > 1 ? 'foram adicionados' : 'foi adicionado'} à sua conta!`,
            tipo: 'TROCA_PROPOSTA',
            tipoNovo: 'PACOTE_ABERTO'
          }
        });
        console.log('✅ [WEBHOOK] Notificação criada com sucesso');
      });

      return NextResponse.json({ received: true });
    }

    console.log('📨 [WEBHOOK] Evento não tratado:', event.type);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('❌ [WEBHOOK] Erro ao processar webhook:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 