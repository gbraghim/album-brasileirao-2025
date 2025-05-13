import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || '';

export async function POST(req: Request) {
  try {
    console.log('📨 Webhook recebido');
    
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('⚠️ Assinatura não encontrada');
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Evento validado:', event.type);
    } catch (err) {
      console.error('⚠️ Erro ao validar assinatura do webhook:', err);
      return NextResponse.json(
        { error: 'Erro ao validar assinatura do webhook' },
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, tipo, jogadorId } = session.metadata!;

      console.log('💰 Processando pagamento confirmado:', {
        userId,
        tipo,
        jogadorId,
        sessionId: session.id,
        metadata: session.metadata
      });

      // Validar se o usuário existe
      const usuario = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!usuario) {
        console.error('❌ Usuário não encontrado:', userId);
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }

      if (tipo === 'figurinha_especifica' && jogadorId) {
        // Processar compra de figurinha específica
        console.log('🎯 Processando compra de figurinha específica:', jogadorId);
        
        try {
          await prisma.$transaction(async (tx) => {
            // Primeiro, buscar o jogador
            const jogador = await tx.jogador.findUnique({
              where: { id: jogadorId },
              select: {
                id: true,
                nome: true,
                time: {
                  select: {
                    nome: true
                  }
                }
              }
            });

            if (!jogador) {
              throw new Error('Jogador não encontrado');
            }

            // Criar a figurinha
            const figurinha = await tx.figurinha.create({
              data: {
                jogador: {
                  connect: {
                    id: jogadorId
                  }
                }
              }
            });

            // Adicionar figurinha ao usuário
            await tx.userFigurinha.create({
              data: {
                userId: userId,
                figurinhaId: figurinha.id,
                nomeJogador: jogador.nome,
                nomeTime: jogador.time.nome,
              },
            });

            // Criar notificação para o usuário
            await tx.notificacao.create({
              data: {
                usuarioId: userId,
                tipo: 'TROCA_RECEBIDA',
                tipoNovo: 'FIGURINHA_NOVA',
                mensagem: `🎉 Parabéns! Você acabou de adquirir a figurinha do ${jogador.nome}! Ela já está no seu álbum!`,
                lida: false,
              },
            });
          });

          console.log('✅ Figurinha adicionada com sucesso');
          return NextResponse.json({ received: true });
        } catch (err) {
          console.error('❌ Erro ao processar compra de figurinha:', err);
          return NextResponse.json(
            { error: 'Erro ao processar compra de figurinha' },
            { status: 500 }
          );
        }
      } else if (tipo === 'pacote' && session.metadata?.pacoteId) {
        // Processar compra de pacote
        console.log('🔍 Buscando pacote no banco de dados:', session.metadata.pacoteId);
      const pacote = await prisma.pacotePreco.findUnique({
          where: { id: session.metadata.pacoteId }
      });

      if (!pacote) {
          console.error('❌ Pacote não encontrado:', session.metadata.pacoteId);
        return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });
      }

      const { quantidade } = pacote;
      console.log('📦 Pacote encontrado:', { quantidade });

      // Criar os pacotes para o usuário em uma transação
      console.log('➕ Criando pacotes para o usuário');
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
        console.log('✅ Pacotes criados com sucesso');

        // Criar notificação para o usuário
        console.log('📢 Criando notificação para o usuário');
        await tx.notificacao.create({
          data: {
            usuarioId: userId,
            mensagem: `${quantidade} pacote${quantidade > 1 ? 's' : ''} ${quantidade > 1 ? 'foram adicionados' : 'foi adicionado'} à sua conta!`,
            tipo: 'TROCA_PROPOSTA',
            tipoNovo: 'PACOTE_ABERTO'
          }
        });
        console.log('✅ Notificação criada com sucesso');
      });

      return NextResponse.json({ received: true });
      } else {
        console.error('❌ Tipo de compra inválido ou IDs ausentes:', { tipo, jogadorId, pacoteId: session.metadata?.pacoteId });
        return NextResponse.json(
          { error: 'Tipo de compra inválido ou IDs ausentes' },
          { status: 400 }
        );
      }
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