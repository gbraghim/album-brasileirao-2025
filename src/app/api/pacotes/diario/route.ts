import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { criarPacoteDiario } from '@/lib/pacotes';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const pacote = await criarPacoteDiario(session.user.id);
    return NextResponse.json(pacote);
  } catch (error) {
    console.error('Erro ao criar pacote diário:', error);
    return NextResponse.json({ error: 'Erro ao criar pacote diário' }, { status: 500 });
  }
} 