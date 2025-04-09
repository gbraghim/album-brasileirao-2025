import { NextResponse } from 'next/server';
import { sincronizarDados } from '@/lib/api-football';

export async function POST() {
  try {
    await sincronizarDados();
    return NextResponse.json({ message: 'Dados sincronizados com sucesso' });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar dados' },
      { status: 500 }
    );
  }
} 