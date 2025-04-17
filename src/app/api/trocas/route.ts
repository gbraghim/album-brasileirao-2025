import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const trocaInclude = {
  figurinhaOferta: {
    include: {
      jogador: {
        select: {
          id: true,
          nome: true,
          posicao: true,
          numero: true,
          foto: true,
          time: {
            select: {
              id: true,
              nome: true,
              escudo: true
            }
          }
        }
      }
    }
  },
  usuarioEnvia: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  usuarioRecebe: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.TrocaInclude;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('1. Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('2. Usuário autenticado:', session.user.id);

    const trocas = await prisma.troca.findMany({
      where: {
        OR: [
          { usuarioEnviaId: session.user.id },
          { usuarioRecebeId: session.user.id }
        ],
        status: 'PENDENTE'
      },
      include: trocaInclude,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('3. Trocas encontradas no banco:', trocas);

    // Separar as trocas em diferentes categorias
    const minhasTrocas = trocas.filter(troca => troca.usuarioEnviaId === session.user.id);
    const trocasRecebidas = trocas.filter(troca => troca.usuarioRecebeId === session.user.id);
    const trocasDisponiveis = trocas.filter(troca => 
      troca.usuarioEnviaId !== session.user.id && 
      (!troca.usuarioRecebeId || troca.usuarioRecebeId === session.user.id)
    );

    console.log('4. Trocas separadas:', {
      minhasTrocas,
      trocasRecebidas,
      trocasDisponiveis
    });

    return NextResponse.json({
      minhasTrocas,
      trocasRecebidas,
      trocasDisponiveis
    });
  } catch (error) {
    console.error('5. Erro ao buscar trocas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar trocas' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { figurinhaId } = await req.json();

    if (!figurinhaId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Verifica se a figurinha já está em uma troca pendente
    const trocaExistente = await prisma.troca.findFirst({
      where: {
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

    const troca = await prisma.troca.create({
      data: {
        figurinhaOfertaId: figurinhaId,
        usuarioEnviaId: session.user.id,
        status: 'PENDENTE'
      },
      include: trocaInclude
    });

    return NextResponse.json(troca);
  } catch (error) {
    console.error('Erro ao criar troca:', error);
    return NextResponse.json(
      { error: 'Erro ao criar troca' },
      { status: 500 }
    );
  }
} 