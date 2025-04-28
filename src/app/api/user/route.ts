import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  const usuario = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!usuario) {
    return new NextResponse('Usuário não encontrado', { status: 404 });
  }

  // Removendo a senha do objeto antes de enviar
  const { password, ...usuarioSemSenha } = usuario;

  return NextResponse.json(usuarioSemSenha);
} 