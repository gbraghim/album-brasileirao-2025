import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Teste de conexão básica
    const testConnection = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Teste de conexão:', testConnection);
    
    // Teste de leitura de dados
    const usersCount = await prisma.user.count();
    console.log('Total de usuários:', usersCount);
    
    // Teste de leitura de figurinhas
    const figurinhasCount = await prisma.figurinha.count();
    console.log('Total de figurinhas:', figurinhasCount);

    return NextResponse.json({
      status: 'success',
      message: 'Conexão com o banco de dados funcionando corretamente',
      data: {
        connectionTest: testConnection,
        usersCount,
        figurinhasCount
      }
    });
  } catch (error) {
    console.error('Erro ao testar conexão com o banco de dados:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao conectar com o banco de dados',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 