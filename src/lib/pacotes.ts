import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Jogador } from '@prisma/client';

const TIMES_SERIE_A = [
  'america-mg', 'athletico-pr', 'atletico-mg', 'bahia', 'botafogo',
  'corinthians', 'cruzeiro', 'cuiaba', 'flamengo', 'fluminense',
  'fortaleza', 'gremio', 'internacional', 'palmeiras', 'bragantino',
  'santos', 'sao-paulo', 'vasco', 'vitoria', 'juventude'
];

const JOGADORES_POR_TIME = 25; // 25 jogadores por time
const FIGURINHAS_POR_PACOTE = 5; // Cada pacote contém exatamente 5 figurinhas

export async function verificarPacotesIniciais() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { pacotes: true }
  });

  if (!user) return null;

  // Verifica se já recebeu os pacotes iniciais
  const pacotesIniciais = user.pacotes.filter(p => p.tipo === 'INICIAL');
  if (pacotesIniciais.length === 0) {
    // Cria 5 pacotes iniciais
    const pacotes = await Promise.all(
      Array(5).fill(null).map(() => 
        prisma.pacote.create({
          data: {
            userId: user.id,
            tipo: 'INICIAL'
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
    p.tipo === 'DIARIO' && 
    new Date(p.createdAt) >= hoje
  );

  if (pacotesDiarios.length === 0) {
    // Cria 1 pacote diário
    const pacote = await prisma.pacote.create({
      data: {
        userId: user.id,
        tipo: 'DIARIO'
      }
    });

    // Gera as figurinhas para o pacote
    await gerarFigurinhasParaPacote(pacote.id);

    return 1; // Retorna quantidade de pacotes gerados
  }

  return 0;
}

async function gerarFigurinhasParaPacote(pacoteId: string) {
  // Buscar todos os jogadores do banco de dados
  const totalJogadores = await prisma.jogador.count();
  const jogadores: Jogador[] = [];
  
  // Selecionar 5 jogadores aleatórios (podendo repetir)
  for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
    // Pegar um offset aleatório
    const randomOffset = Math.floor(Math.random() * totalJogadores);
    
    // Buscar o jogador nesse offset
    const jogador = await prisma.jogador.findFirst({
      skip: randomOffset,
      take: 1
    });
    
    if (jogador) {
      jogadores.push(jogador);
    }
  }
  
  // Obter o ID do usuário proprietário do pacote
  const pacote = await prisma.pacote.findUnique({
    where: { id: pacoteId },
    select: { userId: true }
  });
  
  if (!pacote?.userId) return;
  
  // Criar as figurinhas no pacote
  for (const jogador of jogadores) {
    try {
      // Criar a figurinha no pacote
      const figurinha = await prisma.figurinha.create({
        data: {
          pacoteId,
          jogadorId: jogador.id
        }
      });
      
      // Verificar se já existe essa figurinha na coleção do usuário
      await prisma.$transaction(async (tx) => {
        // Tentar encontrar uma userFigurinha existente para este jogador
        const existingUserFigurinha = await tx.$queryRaw`
          SELECT uf.id, uf.quantidade 
          FROM "UserFigurinha" uf
          JOIN "Figurinha" f ON uf."figurinhaId" = f.id
          WHERE uf."userId" = ${pacote.userId}
          AND f."jogadorId" = ${jogador.id}
          LIMIT 1
        `;
        
        if (Array.isArray(existingUserFigurinha) && existingUserFigurinha.length > 0) {
          // Incrementar a quantidade
          await tx.$executeRaw`
            UPDATE "UserFigurinha"
            SET quantidade = quantidade + 1
            WHERE id = ${existingUserFigurinha[0].id}
          `;
        } else {
          // Criar uma nova entrada
          await tx.$executeRaw`
            INSERT INTO "UserFigurinha" ("id", "userId", "figurinhaId", "quantidade", "createdAt", "updatedAt")
            VALUES (
              gen_random_uuid(), 
              ${pacote.userId}, 
              ${figurinha.id}, 
              1, 
              NOW(), 
              NOW()
            )
          `;
        }
      });
    } catch (error) {
      console.error('Erro ao processar figurinha para usuário:', error);
    }
  }
}

export async function getPacotesDisponiveis(email: string) {
  if (!email) return null;

  try {
    // Primeiro, encontrar o usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('Usuário não encontrado');
      return null;
    }

    // Depois, buscar os pacotes do usuário
    const pacotes = await prisma.pacote.findMany({
      where: {
        userId: user.id
      },
      include: {
        figurinhas: {
          include: {
            jogador: {
              include: {
                time: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Encontrados ${pacotes.length} pacotes para o usuário ${email}`);
    return pacotes;
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error);
    return null;
  }
}

export async function getFigurinhasDoUsuario() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  try {
    // Buscar as figurinhas do usuário usando SQL bruto para evitar problemas de geração de tipos
    const figurinhasDoUsuario = await prisma.$queryRaw`
      SELECT 
        uf.id as "userFigurinhaId",
        uf.quantidade,
        f.id as "figurinhaId",
        j.id as "jogadorId",
        j.nome as "jogadorNome",
        j.numero,
        j.posicao,
        t.id as "timeId",
        t.nome as "timeNome",
        t.escudo
      FROM "UserFigurinha" uf
      JOIN "Figurinha" f ON uf."figurinhaId" = f.id
      JOIN "Jogador" j ON f."jogadorId" = j.id
      JOIN "Time" t ON j."timeId" = t.id
      JOIN "User" u ON uf."userId" = u.id
      WHERE u.email = ${session.user.email}
    `;

    return figurinhasDoUsuario;
  } catch (error) {
    console.error('Erro ao buscar figurinhas do usuário:', error);
    return null;
  }
}

export async function criarPacotesParaUsuario(email: string, quantidade: number) {
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) return null;

  // Criar os pacotes
  const pacotes = await Promise.all(
    Array(quantidade).fill(null).map(() => 
      prisma.pacote.create({
        data: {
          userId: user.id,
          tipo: 'INICIAL'
        }
      })
    )
  );

  // Gera as figurinhas para cada pacote
  for (const pacote of pacotes) {
    await gerarFigurinhasParaPacote(pacote.id);
  }

  return pacotes.length;
} 