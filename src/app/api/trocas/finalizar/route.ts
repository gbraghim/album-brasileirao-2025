import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TrocaStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId } = await request.json();

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar a troca com todas as informações necessárias
    const troca = await prisma.troca.findUnique({
      where: { 
        id: trocaId,
        status: TrocaStatus.ACEITA
      },
      include: {
        figurinhaOferta: true,
        figurinhaSolicitada: true
      }
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada ou não está aceita' }, { status: 404 });
    }

    // Verificar se o usuário é o dono da figurinha ofertada
    if (troca.usuarioEnviaId !== usuario.id) {
      return NextResponse.json({ error: 'Você não tem permissão para finalizar esta troca' }, { status: 403 });
    }

    // Atualizar os donos das figurinhas em uma transação
    const result = await prisma.$transaction([
      // Atualizar o dono da figurinha ofertada
      prisma.userFigurinha.update({
        where: {
          userId_figurinhaId: {
            userId: troca.usuarioEnviaId,
            figurinhaId: troca.figurinhaOfertaId
          }
        },
        data: {
          quantidade: {
            decrement: 1
          }
        }
      }),
      // Adicionar a figurinha ofertada ao usuário que recebe
      prisma.userFigurinha.upsert({
        where: {
          userId_figurinhaId: {
            userId: troca.usuarioRecebeId!,
            figurinhaId: troca.figurinhaOfertaId
          }
        },
        create: {
          userId: troca.usuarioRecebeId!,
          figurinhaId: troca.figurinhaOfertaId,
          quantidade: 1
        },
        update: {
          quantidade: {
            increment: 1
          }
        }
      }),
      // Atualizar o dono da figurinha solicitada
      prisma.userFigurinha.update({
        where: {
          userId_figurinhaId: {
            userId: troca.usuarioRecebeId!,
            figurinhaId: troca.figurinhaSolicitadaId!
          }
        },
        data: {
          quantidade: {
            decrement: 1
          }
        }
      }),
      // Adicionar a figurinha solicitada ao usuário que envia
      prisma.userFigurinha.upsert({
        where: {
          userId_figurinhaId: {
            userId: troca.usuarioEnviaId,
            figurinhaId: troca.figurinhaSolicitadaId!
          }
        },
        create: {
          userId: troca.usuarioEnviaId,
          figurinhaId: troca.figurinhaSolicitadaId!,
          quantidade: 1
        },
        update: {
          quantidade: {
            increment: 1
          }
        }
      }),
      // Atualizar o status da troca para CANCELADA (já que não temos FINALIZADA)
      prisma.troca.update({
        where: { id: trocaId },
        data: { status: TrocaStatus.CANCELADA }
      })
    ]);

    return NextResponse.json({ message: 'Troca finalizada com sucesso' });
  } catch (error) {
    console.error('Erro ao finalizar troca:', error);
    return NextResponse.json(
      { error: 'Erro ao finalizar troca' },
      { status: 500 }
    );
  }
} 