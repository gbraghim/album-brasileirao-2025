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
  nome: string;
  numero: number | null;
  posicao: string | null;
  nacionalidade: string | null;
  foto: string | null;
  timeId: string;
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

    // Criar 10 pacotes iniciais
    for (let i = 0; i < 10; i++) {
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
    // Buscar todos os jogadores com seus dados e times
    const jogadores = await prisma.jogador.findMany({
      include: {
        time: true
      }
    });

    if (jogadores.length === 0) {
      throw new Error('Nenhum jogador encontrado no banco de dados');
    }

    console.log('Total de jogadores encontrados:', jogadores.length);
    console.log('Exemplo de jogador:', {
      id: jogadores[0].id,
      nome: jogadores[0].nome,
      numero: jogadores[0].numero,
      posicao: jogadores[0].posicao,
      nacionalidade: jogadores[0].nacionalidade,
      foto: jogadores[0].foto,
      timeId: jogadores[0].timeId
    });

    // Selecionar 4 jogadores aleatórios
    const jogadoresSelecionados = [];
    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
      const randomIndex = Math.floor(Math.random() * jogadores.length);
      const jogador = jogadores[randomIndex];
      jogadoresSelecionados.push(jogador);
    }

    const figurinhasCriadas = [];

    // Criar as figurinhas uma por uma
    for (const jogador of jogadoresSelecionados) {
      console.log('Criando figurinha para jogador:', jogador.nome);
      
      // Primeiro, criar a figurinha
      const figurinha = await prisma.figurinha.create({
        data: {
          nome: jogador.nome,
          numero: jogador.numero,
          posicao: jogador.posicao,
          nacionalidade: jogador.nacionalidade,
          foto: jogador.foto,
          timeId: jogador.timeId,
          jogadorId: jogador.id,
          pacoteId: pacoteId
        }
      });

      console.log('Figurinha base criada:', {
        id: figurinha.id,
        nome: figurinha.nome,
        numero: figurinha.numero,
        posicao: figurinha.posicao
      });

      // Depois, criar a relação com o usuário separadamente
      const userFigurinha = await prisma.userFigurinha.create({
        data: {
          userId: userId,
          figurinhaId: figurinha.id,
          quantidade: 1
        }
      });

      console.log('UserFigurinha criada:', {
        id: userFigurinha.id,
        userId: userFigurinha.userId,
        figurinhaId: userFigurinha.figurinhaId
      });

      // Verificar se a figurinha foi criada corretamente
      const figurinhaVerificada = await prisma.figurinha.findUnique({
        where: { id: figurinha.id },
        include: {
          jogador: true,
          time: true,
          userFigurinhas: true
        }
      });

      if (!figurinhaVerificada || !figurinhaVerificada.nome) {
        throw new Error(`Erro na criação da figurinha para ${jogador.nome}`);
      }

      figurinhasCriadas.push(figurinhaVerificada);
    }

    console.log(`${figurinhasCriadas.length} figurinhas criadas com sucesso`);
    return figurinhasCriadas;

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