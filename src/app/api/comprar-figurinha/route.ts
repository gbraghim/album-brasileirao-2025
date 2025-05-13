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
    console.log('Iniciando processamento da compra...');
    
    const session = await getServerSession(authOptions);
    console.log('Sessão do usuário:', session?.user?.id);

    if (!session?.user?.id) {
      console.log('Usuário não autorizado');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Corpo da requisição:', body);
    
    const { jogadorId, raridade } = body;
    console.log('Dados recebidos:', { jogadorId, raridade });

    if (!jogadorId || !raridade) {
      console.log('Dados inválidos:', { jogadorId, raridade });
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

    console.log('Jogador encontrado:', jogador);

    if (!jogador) {
      console.log('Jogador não encontrado');
      return NextResponse.json(
        { error: 'Jogador não encontrado' },
        { status: 404 }
      );
    }

    if (jogador.raridade !== raridade) {
      console.log('Raridade não corresponde:', { jogadorRaridade: jogador.raridade, raridadeSolicitada: raridade });
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

    console.log('Produto encontrado:', produto);

    if (!produto) {
      console.log('Produto não encontrado para a raridade:', raridade);
      return NextResponse.json(
        { error: 'Produto não encontrado para esta raridade' },
        { status: 404 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY não configurada');
      return NextResponse.json(
        { error: 'Configuração do Stripe inválida' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL não configurada');
      return NextResponse.json(
        { error: 'URL da aplicação não configurada' },
        { status: 500 }
      );
    }

    if (!produto.stripe_price_id) {
      console.error('stripe_price_id não encontrado para o produto:', produto);
      return NextResponse.json(
        { error: 'Preço do produto não configurado' },
        { status: 500 }
      );
    }

    console.log('Criando sessão de checkout...');
    console.log('Dados da sessão:', {
      jogadorNome: jogador.nome,
      timeNome: jogador.time.nome,
      stripePriceId: produto.stripe_price_id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pacotes?success=true&jogadorId=${jogadorId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pacotes?canceled=true`
    });

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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pacotes?success=true&jogadorId=${jogadorId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pacotes?canceled=true`,
        metadata: {
          userId: session.user.id,
          jogadorId,
          tipo: 'figurinha_especifica'
        },
      });

      console.log('Sessão de checkout criada:', checkoutSession.id);

      await prisma.notificacao.create({
        data: {
          usuarioId: session.user.id,
          tipo: 'TROCA_RECEBIDA',
          tipoNovo: 'FIGURINHA_NOVA',
          mensagem: `🎉 Parabéns! Você acabou de adquirir a figurinha do ${jogador.nome}! Ela já está no seu álbum!`,
          lida: false,
        },
      });

      console.log('Notificação criada com sucesso');

      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError) {
      console.error('Erro ao criar sessão do Stripe:', stripeError);
      if (stripeError instanceof Stripe.errors.StripeError) {
        console.error('Detalhes do erro do Stripe:', {
          type: stripeError.type,
          code: stripeError.code,
          message: stripeError.message,
          raw: stripeError.raw
        });
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
    console.error('Erro detalhado ao processar compra:', error);
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Erro do Stripe:', {
        type: error.type,
        code: error.code,
        message: error.message,
        raw: error.raw
      });
    }
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