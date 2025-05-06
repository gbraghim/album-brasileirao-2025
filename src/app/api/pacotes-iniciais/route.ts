import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verificarPacotesIniciais } from '@/lib/pacotes';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    await verificarPacotesIniciais(session.user.id);

    return NextResponse.json(
      { message: 'Pacotes iniciais criados com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar pacotes iniciais:', error);
    return NextResponse.json(
      { message: 'Erro ao criar pacotes iniciais' },
      { status: 500 }
    );
  }
} 