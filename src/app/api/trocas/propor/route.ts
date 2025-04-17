import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Iniciando POST /api/trocas/propor');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.email) {
      console.log('Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { trocaId, figurinhaId } = await request.json();
    console.log('Dados recebidos:', { trocaId, figurinhaId });

    // Buscar o usuário pelo email
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log('Usuário encontrado:', usuario);

    if (!usuario) {
      console.log('Usuário não encontrado no banco');
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
      },
      include: {
        figurinha: {
          include: {
            jogador: true
          }
        }
      }
    });
    console.log('Usuário figurinha encontrada:', usuarioFigurinha);

    if (!usuarioFigurinha) {
      console.log('Figurinha não encontrada ou não está disponível para troca');
      return NextResponse.json(
        { error: 'Figurinha não encontrada ou não está disponível para troca' },
        { status: 404 }
      );
    }

    // Buscar a troca original
    const trocaOriginal = await prisma.troca.findUnique({
      where: { 
        id: trocaId,
        status: 'PENDENTE' // Garante que a troca ainda está disponível
      },
      include: {
        figurinhaOferta: {
          include: {
            jogador: true
          }
        },
        usuarioEnvia: true
      }
    });
    console.log('Troca original:', trocaOriginal);

    if (!trocaOriginal) {
      console.log('Troca não encontrada ou não está mais disponível');
      return NextResponse.json({ error: 'Troca não encontrada ou não está mais disponível' }, { status: 404 });
    }

    // Verificar se o usuário não está tentando propor troca para si mesmo
    if (trocaOriginal.usuarioEnviaId === usuario.id) {
      console.log('Não é possível propor troca para si mesmo');
      return NextResponse.json({ error: 'Não é possível propor troca para si mesmo' }, { status: 400 });
    }

    // Criar nova troca com status PENDENTE
    const novaTroca = await prisma.troca.create({
      data: {
        usuarioEnviaId: usuario.id,
        figurinhaOfertaId: figurinhaId,
        status: 'PENDENTE',
        usuarioRecebeId: trocaOriginal.usuarioEnviaId
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
    console.log('Nova troca criada:', novaTroca);

    // Criar notificação para o usuário que recebeu a proposta
    await prisma.notificacao.create({
      data: {
        usuarioId: trocaOriginal.usuarioEnviaId,
        tipo: 'PROPOSTA_RECEBIDA',
        mensagem: `${usuario.name} propôs uma troca: ${usuarioFigurinha.figurinha.jogador.nome} pelo seu ${trocaOriginal.figurinhaOferta.jogador.nome}`,
        lida: false,
        trocaId: novaTroca.id
      }
    });

    return NextResponse.json(novaTroca);
  } catch (error) {
    console.error('Erro ao propor troca:', error);
    return NextResponse.json(
      { error: 'Erro ao propor troca' },
      { status: 500 }
    );
  }
} 