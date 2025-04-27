import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    console.log('1. Iniciando busca de notificações');
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('2. Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('3. Usuário autenticado:', session.user.id);

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: session.user.id,
      },
      include: {
        troca: {
          include: {
            figurinhaOferta: {
              include: {
                jogador: {
                  include: {
                    time: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('4. Notificações encontradas:', notificacoes.length);

    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error('5. Erro detalhado ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('1. Iniciando criação de notificação');
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('2. Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('3. Usuário autenticado:', session.user.id);

    const { tipo, mensagem, trocaId, usuarioId } = await request.json();
    console.log('4. Dados recebidos:', { tipo, mensagem, trocaId, usuarioId });

    if (!tipo || !mensagem || !usuarioId) {
      console.log('5. Dados inválidos');
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        tipo,
        mensagem,
        trocaId,
        usuarioId
      }
    });

    console.log('6. Notificação criada:', notificacao.id);

    return NextResponse.json(notificacao);
  } catch (error) {
    console.error('7. Erro detalhado ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
} 