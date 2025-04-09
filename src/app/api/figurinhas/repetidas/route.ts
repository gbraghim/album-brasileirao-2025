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
        pacotes: {
          include: {
            figurinhas: {
              where: {
                repetida: true
              }
            }
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

    // Extrai todas as figurinhas repetidas dos pacotes
    const figurinhasRepetidas = user.pacotes.flatMap(pacote => pacote.figurinhas);

    return NextResponse.json(figurinhasRepetidas);
  } catch (error) {
    console.error('Erro ao buscar figurinhas repetidas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar figurinhas repetidas' },
      { status: 500 }
    );
  }
} 