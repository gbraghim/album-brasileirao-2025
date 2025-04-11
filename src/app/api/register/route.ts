import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verificarPacotesIniciais } from '@/lib/pacotes';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as RegisterRequest;
    const { name, email, password } = body;

    // Validação dos campos
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação dos tipos
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Formato inválido dos dados' },
        { status: 400 }
      );
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação da senha
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hash(password, 12);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Tenta criar os pacotes iniciais, mas não falha se der erro
    try {
      await verificarPacotesIniciais(user.id);
    } catch (error) {
      console.error('Erro ao criar pacotes iniciais:', error);
      // Não lança o erro, apenas loga
    }

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso', 
        user 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { message: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
} 