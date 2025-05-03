import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const { senhaAtual, novaSenha, confirmarSenha } = await req.json();
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }
    if (novaSenha !== confirmarSenha) {
      return NextResponse.json({ error: 'A confirmação não confere.' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    const isValid = await bcrypt.compare(senhaAtual, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 });
    }
    const hash = await bcrypt.hash(novaSenha, 10);
    await prisma.user.update({ where: { email: session.user.email }, data: { password: hash } });
    return NextResponse.json({ message: 'Senha alterada com sucesso.' });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    return NextResponse.json({ error: 'Erro ao trocar senha.' }, { status: 500 });
  }
} 