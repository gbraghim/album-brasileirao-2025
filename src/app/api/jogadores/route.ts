import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    console.log('Iniciando GET /api/jogadores');
    
    const { searchParams } = new URL(request.url);
    const timeId = searchParams.get('timeId');
    const raridade = searchParams.get('raridade');

    console.log('Parâmetros recebidos:', { timeId, raridade });

    // Se não houver filtros, retorna todos os jogadores
    if (!timeId && !raridade) {
      console.log('Buscando todos os jogadores...');
  try {
    const jogadores = await prisma.jogador.findMany({
          select: {
            id: true,
            nome: true,
            numero: true,
            posicao: true,
            raridade: true,
            time: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        });

        console.log(`Encontrados ${jogadores.length} jogadores`);
        return NextResponse.json(jogadores);
      } catch (dbError) {
        console.error('Erro ao buscar jogadores no banco:', dbError);
        throw dbError;
      }
    }

    // Se houver filtros, aplica-os
    console.log('Aplicando filtros...');
    const where: any = {};
    if (timeId) where.timeId = timeId;
    if (raridade) where.raridade = raridade;

    console.log('Filtros aplicados:', where);

    try {
      const jogadores = await prisma.jogador.findMany({
        where,
        select: {
          id: true,
          nome: true,
          numero: true,
          posicao: true,
          raridade: true,
          time: {
            select: {
              id: true,
              nome: true
            }
          }
      }
    });

      console.log(`Encontrados ${jogadores.length} jogadores com os filtros aplicados`);
    return NextResponse.json(jogadores);
    } catch (dbError) {
      console.error('Erro ao buscar jogadores filtrados no banco:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Erro detalhado ao buscar jogadores:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar jogadores', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 