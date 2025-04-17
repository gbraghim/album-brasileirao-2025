import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { figurinhaId } = await request.json();

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar a troca pendente para a figurinha
    const troca = await prisma.troca.findFirst({
      where: {
        usuarioEnviaId: usuario.id,
        figurinhaOfertaId: figurinhaId,
        status: 'PENDENTE'
      }
    });

    if (!troca) {
      return NextResponse.json(
        { error: 'Figurinha não está disponível para troca' },
        { status: 404 }
      );
    }

    // Remover a troca
    await prisma.troca.delete({
      where: { id: troca.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover figurinha da troca:', error);
    return NextResponse.json(
      { error: 'Erro ao remover figurinha da troca' },
      { status: 500 }
    );
  }
} 