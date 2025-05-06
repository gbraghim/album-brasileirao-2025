import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${session.user.email}-${timestamp}.${extension}`;

    // Salvar o arquivo
    const path = join(process.cwd(), 'public', 'avatars', filename);
    await writeFile(path, buffer);

    // Atualizar o avatar no banco de dados
    const avatarPath = `/avatars/${filename}`;
    await prisma.user.update({
      where: { email: session.user.email! },
      data: { image: avatarPath },
    });

    // Retornar o caminho do arquivo
    return NextResponse.json({ 
      success: true, 
      path: avatarPath 
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
} 