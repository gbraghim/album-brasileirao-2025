import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

function gerarSenhaAleatoria(tamanho = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const novaSenha = gerarSenhaAleatoria();
    const hash = await bcrypt.hash(novaSenha, 10);
    await prisma.user.update({ where: { email }, data: { password: hash } });

    await sendEmail(email, 'Recuperação de senha - Álbum Brasileirão', `Sua nova senha é: ${novaSenha}`);

    return NextResponse.json({ message: 'Uma nova senha foi enviada para seu email.' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return NextResponse.json({ error: 'Erro ao resetar senha' }, { status: 500 });
  }
} 