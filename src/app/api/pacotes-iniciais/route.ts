import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  return NextResponse.json(
    { message: 'Esta rota foi descontinuada. Os pacotes iniciais são verificados automaticamente.' },
    { status: 410 }
  );
} 