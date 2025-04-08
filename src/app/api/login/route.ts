import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Remover a senha do objeto retornado
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Login realizado com sucesso', user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { message: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
} 