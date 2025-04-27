import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, TrocaStatus } from '@prisma/client';

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
    console.log('1. Iniciando rota GET /api/trocas');
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      console.log('2. Usuário não autenticado ou ID inválido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('3. Usuário autenticado:', session.user.id);

    // Buscar todas as trocas pendentes
    console.log('4. Iniciando busca de trocas no banco de dados');
    const todasTrocas = await prisma.troca.findMany({
      where: { status: TrocaStatus.PENDENTE },
      include: trocaInclude,
      orderBy: { createdAt: 'desc' }
    });
    console.log('5. Trocas encontradas:', todasTrocas.length);

    // Filtrar as trocas
    const minhasTrocas = todasTrocas.filter(troca => 
      troca.usuarioEnviaId === session.user.id && 
      !troca.figurinhaSolicitadaId
    );

    const ofertasEnviadas = todasTrocas.filter(troca => 
      troca.usuarioRecebeId === session.user.id && 
      troca.figurinhaSolicitadaId !== null
    );

    const trocasRecebidas = todasTrocas.filter(troca => 
      troca.usuarioEnviaId === session.user.id && 
      troca.figurinhaSolicitadaId !== null
    );

    const trocasDisponiveis = todasTrocas.filter(troca => 
      troca.usuarioEnviaId !== session.user.id && 
      !troca.figurinhaSolicitadaId
    );

    console.log('8. Trocas separadas:', {
      minhasTrocas: minhasTrocas.length,
      ofertasEnviadas: ofertasEnviadas.length,
      trocasRecebidas: trocasRecebidas.length,
      trocasDisponiveis: trocasDisponiveis.length
    });

    // Garantir que todos os objetos sejam serializáveis
    const response = {
      minhasTrocas: minhasTrocas.map(troca => ({
        ...troca,
        createdAt: troca.createdAt?.toISOString() || null,
        updatedAt: troca.updatedAt?.toISOString() || null,
        usuarioEnvia: troca.usuarioEnvia ? {
          id: troca.usuarioEnvia.id,
          name: troca.usuarioEnvia.name,
          email: troca.usuarioEnvia.email
        } : null,
        usuarioRecebe: troca.usuarioRecebe ? {
          id: troca.usuarioRecebe.id,
          name: troca.usuarioRecebe.name,
          email: troca.usuarioRecebe.email
        } : null
      })),
      ofertasEnviadas: ofertasEnviadas.map(troca => ({
        ...troca,
        createdAt: troca.createdAt?.toISOString() || null,
        updatedAt: troca.updatedAt?.toISOString() || null,
        usuarioEnvia: troca.usuarioEnvia ? {
          id: troca.usuarioEnvia.id,
          name: troca.usuarioEnvia.name,
          email: troca.usuarioEnvia.email
        } : null,
        usuarioRecebe: troca.usuarioRecebe ? {
          id: troca.usuarioRecebe.id,
          name: troca.usuarioRecebe.name,
          email: troca.usuarioRecebe.email
        } : null
      })),
      trocasRecebidas: trocasRecebidas.map(troca => ({
        ...troca,
        createdAt: troca.createdAt?.toISOString() || null,
        updatedAt: troca.updatedAt?.toISOString() || null,
        usuarioEnvia: troca.usuarioEnvia ? {
          id: troca.usuarioEnvia.id,
          name: troca.usuarioEnvia.name,
          email: troca.usuarioEnvia.email
        } : null,
        usuarioRecebe: troca.usuarioRecebe ? {
          id: troca.usuarioRecebe.id,
          name: troca.usuarioRecebe.name,
          email: troca.usuarioRecebe.email
        } : null
      })),
      trocasDisponiveis: trocasDisponiveis.map(troca => ({
        ...troca,
        createdAt: troca.createdAt?.toISOString() || null,
        updatedAt: troca.updatedAt?.toISOString() || null,
        usuarioEnvia: troca.usuarioEnvia ? {
          id: troca.usuarioEnvia.id,
          name: troca.usuarioEnvia.name,
          email: troca.usuarioEnvia.email
        } : null,
        usuarioRecebe: troca.usuarioRecebe ? {
          id: troca.usuarioRecebe.id,
          name: troca.usuarioRecebe.name,
          email: troca.usuarioRecebe.email
        } : null
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('9. Erro detalhado ao buscar trocas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar trocas', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log('1. Iniciando criação de troca');
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('2. Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('3. Usuário autenticado:', session.user.id);

    const { figurinhaId } = await req.json();
    console.log('4. Figurinha ID recebida:', figurinhaId);

    if (!figurinhaId) {
      console.log('5. Figurinha ID inválida');
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Verifica se a figurinha já está em uma troca pendente
    console.log('6. Verificando se figurinha já está em troca pendente');
    const trocaExistente = await prisma.troca.findFirst({
      where: {
        figurinhaOfertaId: figurinhaId,
        status: TrocaStatus.PENDENTE
      }
    });

    if (trocaExistente) {
      console.log('7. Figurinha já está em troca pendente');
      return NextResponse.json(
        { error: 'Figurinha já está disponível para troca' },
        { status: 400 }
      );
    }

    console.log('8. Criando nova troca');
    const troca = await prisma.troca.create({
      data: {
        figurinhaOfertaId: figurinhaId,
        usuarioEnviaId: session.user.id,
        status: TrocaStatus.PENDENTE
      },
      include: trocaInclude
    });

    console.log('9. Troca criada com sucesso:', troca.id);

    return NextResponse.json(troca);
  } catch (error) {
    console.error('10. Erro detalhado ao criar troca:', error);
    return NextResponse.json(
      { error: 'Erro ao criar troca' },
      { status: 500 }
    );
  }
} 