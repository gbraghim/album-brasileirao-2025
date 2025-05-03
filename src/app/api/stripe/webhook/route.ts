import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log('📨 Webhook recebido');
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('⚠️ Assinatura do webhook não encontrada');
      return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Evento validado:', event.type);
    } catch (err) {
      console.error('⚠️ Erro ao validar assinatura do webhook:', err);
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, pacoteId } = session.metadata!;

      console.log('💰 Processando pagamento confirmado:', {
        userId,
        pacoteId,
        sessionId: session.id,
        metadata: session.metadata
      });

      // Buscar o pacote para saber quantos pacotes devem ser adicionados
      console.log('🔍 Buscando pacote no banco de dados:', pacoteId);
      const pacote = await prisma.$queryRaw`
        SELECT * FROM "PacotePreco" WHERE id = ${pacoteId}
      `;

      if (!pacote || !Array.isArray(pacote) || pacote.length === 0) {
        console.error('❌ Pacote não encontrado:', pacoteId);
        return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });
      }

      const { quantidade } = pacote[0];
      console.log('📦 Pacote encontrado:', { quantidade });

      // Criar os pacotes para o usuário
      console.log('➕ Criando pacotes para o usuário');
      const pacotesPromises = Array(quantidade).fill(null).map(() => 
        prisma.pacote.create({
          data: {
            userId,
            aberto: false,
            tipo: 'COMPRADO'
          }
        })
      );

      await Promise.all(pacotesPromises);
      console.log('✅ Pacotes criados com sucesso');

      // Criar notificação para o usuário
      console.log('📢 Criando notificação para o usuário');
      await prisma.notificacao.create({
        data: {
          usuarioId: userId,
          mensagem: `${quantidade} pacote${quantidade > 1 ? 's' : ''} ${quantidade > 1 ? 'foram adicionados' : 'foi adicionado'} à sua conta!`,
          tipo: 'TROCA_PROPOSTA',
          tipoNovo: 'PACOTE_ABERTO'
        }
      });
      console.log('✅ Notificação criada com sucesso');

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('❌ Erro ao processar webhook:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 