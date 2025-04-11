import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TIMES = [
  {
    nome: 'Flamengo',
    escudo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Flamengo-RJ_%28BRA%29.png',
    apiId: 1,
    jogadores: [
      { nome: 'Agustín Rossi', numero: 1, posicao: 'Goleiro', idade: 28, nacionalidade: 'Argentina', foto: 'https://example.com/rossi.jpg', apiId: 1 },
      { nome: 'Léo Pereira', numero: 4, posicao: 'Zagueiro', idade: 27, nacionalidade: 'Brasil', foto: 'https://example.com/leo.jpg', apiId: 2 },
      { nome: 'Erick Pulgar', numero: 5, posicao: 'Volante', idade: 29, nacionalidade: 'Chile', foto: 'https://example.com/pulgar.jpg', apiId: 3 },
      { nome: 'De Arrascaeta', numero: 14, posicao: 'Meia', idade: 29, nacionalidade: 'Uruguai', foto: 'https://example.com/arrascaeta.jpg', apiId: 4 },
      { nome: 'Pedro', numero: 9, posicao: 'Atacante', idade: 26, nacionalidade: 'Brasil', foto: 'https://example.com/pedro.jpg', apiId: 5 }
    ]
  },
  {
    nome: 'Palmeiras',
    escudo: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg',
    apiId: 2,
    jogadores: [
      { nome: 'Weverton', numero: 21, posicao: 'Goleiro', idade: 36, nacionalidade: 'Brasil', foto: 'https://example.com/weverton.jpg', apiId: 6 },
      { nome: 'Gustavo Gómez', numero: 15, posicao: 'Zagueiro', idade: 30, nacionalidade: 'Paraguai', foto: 'https://example.com/gomez.jpg', apiId: 7 },
      { nome: 'Zé Rafael', numero: 8, posicao: 'Volante', idade: 30, nacionalidade: 'Brasil', foto: 'https://example.com/zerafael.jpg', apiId: 8 },
      { nome: 'Raphael Veiga', numero: 23, posicao: 'Meia', idade: 28, nacionalidade: 'Brasil', foto: 'https://example.com/veiga.jpg', apiId: 9 },
      { nome: 'Endrick', numero: 9, posicao: 'Atacante', idade: 17, nacionalidade: 'Brasil', foto: 'https://example.com/endrick.jpg', apiId: 10 }
    ]
  }
];

export async function POST() {
  try {
    // Limpar o banco de dados
    await prisma.$executeRaw`DELETE FROM "UserFigurinha"`;
    await prisma.figurinha.deleteMany();
    await prisma.pacote.deleteMany();
    await prisma.jogador.deleteMany();
    await prisma.time.deleteMany();

    // Popular o banco de dados
    for (const time of TIMES) {
      const { jogadores, ...timeData } = time;
      const createdTime = await prisma.time.create({
        data: timeData
      });

      for (const jogador of jogadores) {
        await prisma.jogador.create({
          data: {
            ...jogador,
            timeId: createdTime.id
          }
        });
      }
    }

    return NextResponse.json(
      { message: 'Banco de dados populado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
    return NextResponse.json(
      { message: 'Erro ao popular banco de dados' },
      { status: 500 }
    );
  }
} 