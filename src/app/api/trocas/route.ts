import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trocasEnviadas: {
          include: {
            figurinhaOferta: true
          }
        },
        trocasRecebidas: {
          include: {
            figurinhaOferta: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Combinar trocas enviadas e recebidas
    const todasTrocas = [
      ...user.trocasEnviadas.map(t => ({ ...t, tipo: 'enviada' })),
      ...user.trocasRecebidas.map(t => ({ ...t, tipo: 'recebida' }))
    ];

    return NextResponse.json(todasTrocas);
  } catch (error) {
    console.error('Erro ao buscar trocas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar trocas' },
      { status: 500 }
    );
  }
} 