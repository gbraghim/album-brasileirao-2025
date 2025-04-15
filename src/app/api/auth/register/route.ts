import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, username, password } = await request.json();

    console.log('Dados recebidos:', { name, email, username });

    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se o username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Nome de usuário já cadastrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Criando usuário...');

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    console.log('Usuário criado com sucesso:', user);

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro detalhado ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
} 