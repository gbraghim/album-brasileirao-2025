import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const TIMES_SERIE_A = [
  'america-mg', 'athletico-pr', 'atletico-mg', 'bahia', 'botafogo',
  'corinthians', 'cruzeiro', 'cuiaba', 'flamengo', 'fluminense',
  'fortaleza', 'gremio', 'internacional', 'palmeiras', 'bragantino',
  'santos', 'sao-paulo', 'vasco', 'vitoria', 'juventude'
];

const JOGADORES_POR_TIME = 25; // 25 jogadores por time
const FIGURINHAS_POR_PACOTE = 4;

export async function verificarPacotesIniciais() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { pacotes: true }
  });

  if (!user) return null;

  // Verifica se já recebeu os pacotes iniciais
  const pacotesIniciais = user.pacotes.filter(p => p.tipo === 'cadastro');
  if (pacotesIniciais.length === 0) {
    // Cria 5 pacotes iniciais
    const pacotes = await Promise.all(
      Array(5).fill(null).map(() => 
        prisma.pacote.create({
          data: {
            userId: user.id,
            tipo: 'cadastro'
          }
        })
      )
    );

    // Gera as figurinhas para cada pacote
    for (const pacote of pacotes) {
      await gerarFigurinhasParaPacote(pacote.id);
    }

    return 5; // Retorna quantidade de pacotes gerados
  }

  return 0;
}

export async function verificarPacotesDiarios() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { pacotes: true }
  });

  if (!user) return null;

  // Verifica pacotes diários do dia atual
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const pacotesDiarios = user.pacotes.filter(p => 
    p.tipo === 'diario' && 
    new Date(p.createdAt) >= hoje
  );

  if (pacotesDiarios.length === 0) {
    // Cria 3 pacotes diários
    const pacotes = await Promise.all(
      Array(3).fill(null).map(() => 
        prisma.pacote.create({
          data: {
            userId: user.id,
            tipo: 'diario'
          }
        })
      )
    );

    // Gera as figurinhas para cada pacote
    for (const pacote of pacotes) {
      await gerarFigurinhasParaPacote(pacote.id);
    }

    return 3; // Retorna quantidade de pacotes gerados
  }

  return 0;
}

async function gerarFigurinhasParaPacote(pacoteId: string) {
  const figurinhas = [];
  
  for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
    const time = TIMES_SERIE_A[Math.floor(Math.random() * TIMES_SERIE_A.length)];
    const numero = Math.floor(Math.random() * JOGADORES_POR_TIME) + 1;

    figurinhas.push({
      pacoteId,
      jogadorId: `jogador-${time}-${numero}`, // ID temporário até termos os jogadores reais
      numero,
      time
    });
  }

  await prisma.figurinha.createMany({
    data: figurinhas
  });
}

export async function getPacotesDisponiveis() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { pacotes: true }
  });

  if (!user) return null;

  return user.pacotes;
} 