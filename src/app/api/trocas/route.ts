import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário pelo email
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar figurinhas do usuário disponíveis para troca
    const minhasTrocas = await prisma.troca.findMany({
      where: {
        usuarioEnviaId: usuario.id,
        status: 'PENDENTE'
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        }
      }
    });

    // Buscar figurinhas de outros usuários disponíveis para troca
    const outrasTrocas = await prisma.troca.findMany({
      where: {
        usuarioEnviaId: {
          not: usuario.id
        },
        status: 'PENDENTE'
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        },
        usuarioEnvia: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      minhasTrocas,
      outrasTrocas
    });
  } catch (error) {
    console.error('Erro ao buscar figurinhas para troca:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar figurinhas para troca' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { figurinhaId } = await request.json();

    // Buscar o usuário pelo email
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se a figurinha pertence ao usuário e está repetida
    const usuarioFigurinha = await prisma.userFigurinha.findFirst({
      where: {
        userId: usuario.id,
        figurinhaId,
        quantidade: {
          gt: 1 // Apenas figurinhas repetidas podem ser trocadas
        }
      }
    });

    if (!usuarioFigurinha) {
      return NextResponse.json(
        { error: 'Figurinha não encontrada ou não está disponível para troca' },
        { status: 404 }
      );
    }

    // Verificar se a figurinha já está disponível para troca
    const trocaExistente = await prisma.troca.findFirst({
      where: {
        usuarioEnviaId: usuario.id,
        figurinhaOfertaId: figurinhaId,
        status: 'PENDENTE'
      }
    });

    if (trocaExistente) {
      return NextResponse.json(
        { error: 'Figurinha já está disponível para troca' },
        { status: 400 }
      );
    }

    // Criar nova troca
    const novaTroca = await prisma.troca.create({
      data: {
        usuarioEnviaId: usuario.id,
        figurinhaOfertaId: figurinhaId,
        status: 'PENDENTE'
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        }
      }
    });

    return NextResponse.json(novaTroca);
  } catch (error) {
    console.error('Erro ao criar troca:', error);
    return NextResponse.json(
      { error: 'Erro ao criar troca' },
      { status: 500 }
    );
  }
} 