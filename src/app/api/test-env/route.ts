import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL ? '***CONFIGURADO***' : 'NÃO CONFIGURADO'
    };

    return NextResponse.json({
      status: 'success',
      message: 'Variáveis de ambiente carregadas',
      data: envVars
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao verificar variáveis de ambiente',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 