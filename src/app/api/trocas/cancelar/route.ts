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

    const { trocaId } = await request.json();

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar a troca
    const troca = await prisma.troca.findUnique({
      where: { id: trocaId }
    });

    if (!troca) {
      return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é o dono da troca
    if (troca.usuarioEnviaId !== usuario.id) {
      return NextResponse.json({ error: 'Você não tem permissão para cancelar esta troca' }, { status: 403 });
    }

    // Verificar se a troca pode ser cancelada (status PENDENTE)
    if (troca.status !== 'PENDENTE') {
      return NextResponse.json({ error: 'Esta troca não pode ser cancelada' }, { status: 400 });
    }

    // Cancelar a troca
    const trocaCancelada = await prisma.troca.update({
      where: { id: trocaId },
      data: { status: 'CANCELADA' }
    });

    return NextResponse.json({ message: 'Troca cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar troca:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar troca' },
      { status: 500 }
    );
  }
} 