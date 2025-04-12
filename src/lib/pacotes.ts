import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { Jogador, Prisma } from '@prisma/client';

interface PacoteRaw {
  id: string;
  userId: string;
  tipo: string;
  aberto: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FigurinhaRaw {
  id: string;
  pacoteId: string;
  jogadorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TIMES_SERIE_A = [
  'america-mg', 'athletico-pr', 'atletico-mg', 'bahia', 'botafogo',
  'corinthians', 'cruzeiro', 'cuiaba', 'flamengo', 'fluminense',
  'fortaleza', 'gremio', 'internacional', 'palmeiras', 'bragantino',
  'santos', 'sao-paulo', 'vasco', 'vitoria', 'juventude'
];

const JOGADORES_POR_TIME = 25; // 25 jogadores por time
const FIGURINHAS_POR_PACOTE = 4; // Cada pacote contém exatamente 4 figurinhas

// Verifica e cria pacotes iniciais para novos usuários
export async function verificarPacotesIniciais(userId: string) {
  try {
    // Buscar o usuário para verificar se é primeiro acesso
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { primeiroAcesso: true }
    });

    if (!usuario || !usuario.primeiroAcesso) {
      return;
    }

    // Criar 6 pacotes iniciais
    for (let i = 0; i < 6; i++) {
      await prisma.pacote.create({
        data: {
          userId,
          tipo: 'INICIAL',
          aberto: false
        }
      });
    }

    // Atualizar o status de primeiro acesso
    await prisma.user.update({
      where: { id: userId },
      data: { primeiroAcesso: false }
    });
  } catch (error) {
    console.error('Erro ao criar pacotes iniciais:', error);
    throw error;
  }
}

// Verifica e cria pacotes diários
export async function verificarPacotesDiarios(userId: string) {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Verifica se o usuário já recebeu os pacotes diários hoje
    const pacotesDiarios = await prisma.$queryRaw<PacoteRaw[]>`
      SELECT * FROM "Pacote"
      WHERE "userId" = ${userId}
      AND "tipo" = 'DIARIO'
      AND "createdAt" >= ${hoje}
    `;

    // Se não houver pacotes diários hoje, cria 3 pacotes
    if (pacotesDiarios.length === 0) {
      for (let i = 0; i < 3; i++) {
        const [pacote] = await prisma.$queryRaw<PacoteRaw[]>`
          INSERT INTO "Pacote" ("id", "userId", "tipo", "aberto", "createdAt", "updatedAt")
          VALUES (
            ${Prisma.sql`gen_random_uuid()`},
            ${userId},
            'DIARIO',
            false,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING *
        `;
        
        await gerarFigurinhasParaPacote(pacote.id, userId);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar pacotes diários:', error);
    throw error;
  }
}

async function gerarFigurinhasParaPacote(pacoteId: string, userId: string) {
  try {
    // Buscar todos os IDs dos jogadores
    const jogadoresIds = await prisma.jogador.findMany({
      select: { id: true }
    });

    if (jogadoresIds.length === 0) {
      throw new Error('Nenhum jogador encontrado no banco de dados');
    }

    // Selecionar 4 jogadores aleatórios
    const jogadoresSelecionados = [];
    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
      const randomIndex = Math.floor(Math.random() * jogadoresIds.length);
      const jogadorId = jogadoresIds[randomIndex].id;
      jogadoresSelecionados.push(jogadorId);
    }

    // Criar as figurinhas no pacote e a relação com o usuário
    for (const jogadorId of jogadoresSelecionados) {
      // Criar a figurinha
      const [figurinha] = await prisma.$queryRaw<FigurinhaRaw[]>`
        INSERT INTO "Figurinha" ("id", "pacoteId", "jogadorId", "createdAt", "updatedAt")
        VALUES (
          ${Prisma.sql`gen_random_uuid()`},
          ${pacoteId},
          ${jogadorId},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING *
      `;

      // Criar ou atualizar a relação com o usuário
      await prisma.$executeRaw`
        INSERT INTO "UserFigurinha" ("id", "userId", "figurinhaId", "quantidade", "createdAt", "updatedAt")
        VALUES (
          ${Prisma.sql`gen_random_uuid()`},
          ${userId},
          ${figurinha.id},
          1,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT ("userId", "figurinhaId")
        DO UPDATE SET
          "quantidade" = "UserFigurinha"."quantidade" + 1,
          "updatedAt" = CURRENT_TIMESTAMP
      `;
    }
  } catch (error) {
    console.error('Erro ao gerar figurinhas para pacote:', error);
    throw error;
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
  const pacotes: PacoteRaw[] = [];
  for (let i = 0; i < quantidade; i++) {
    const [pacote] = await prisma.$queryRaw<PacoteRaw[]>`
      INSERT INTO "Pacote" ("id", "userId", "tipo", "aberto", "createdAt", "updatedAt")
      VALUES (
        ${Prisma.sql`gen_random_uuid()`},
        ${user.id},
        'CADASTRO',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;
    pacotes.push(pacote);
  }

  // Gera as figurinhas para cada pacote
  for (const pacote of pacotes) {
    await gerarFigurinhasParaPacote(pacote.id, user.id);
  }

  return pacotes.length;
} 