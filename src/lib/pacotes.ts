import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { Jogador, Prisma, TipoPacote } from '@prisma/client';

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
    console.log(`Verificando pacotes iniciais para usuário ${userId}`);
    
    // Buscar o usuário para verificar se é primeiro acesso
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { primeiroAcesso: true }
    });

    if (!usuario) {
      console.log('Usuário não encontrado');
      return;
    }

    if (!usuario.primeiroAcesso) {
      console.log('Usuário já recebeu pacotes iniciais anteriormente');
      return;
    }

    // Verificar se já existem pacotes iniciais
    const pacotesExistentes = await prisma.pacote.findMany({
      where: {
        userId,
        tipo: TipoPacote.INICIAL
      }
    });

    if (pacotesExistentes.length > 0) {
      console.log(`Usuário ${userId} já possui ${pacotesExistentes.length} pacotes iniciais`);
      return;
    }

    console.log('Criando 3 pacotes iniciais...');
    
    // Criar 3 pacotes iniciais dentro de uma transação
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < 3; i++) {
        const pacote = await tx.pacote.create({
          data: {
            userId,
            tipo: TipoPacote.INICIAL,
            aberto: false
          }
        });
        
        console.log(`Pacote inicial ${i + 1} criado:`, {
          id: pacote.id,
          tipo: pacote.tipo,
          userId: pacote.userId
        });
      }

      // Atualizar o status de primeiro acesso
      await tx.user.update({
        where: { id: userId },
        data: { primeiroAcesso: false }
      });
    });

    console.log('Pacotes iniciais criados com sucesso');
  } catch (error) {
    console.error('Erro ao criar pacotes iniciais:', error);
    throw error;
  }
}

// Verifica e cria pacotes diários
export async function verificarPacotesDiarios(userId: string) {
  try {
    // Verifica se o usuário já recebeu os pacotes diários hoje
    const pacotesDiarios = await prisma.pacote.findMany({
      where: {
        userId,
        tipo: TipoPacote.DIARIO,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    if (pacotesDiarios.length > 0) {
      console.log(`Usuário ${userId} já possui ${pacotesDiarios.length} pacotes diários hoje`);
      return;
    }

    console.log(`Criando 3 pacotes diários para usuário ${userId}`);
    
    // Criar 3 pacotes diários
    for (let i = 0; i < 3; i++) {
      const pacote = await prisma.pacote.create({
        data: {
          userId,
          tipo: TipoPacote.DIARIO,
          aberto: false
        }
      });

      console.log(`Pacote diário ${i + 1} criado:`, {
        id: pacote.id,
        tipo: pacote.tipo,
        userId: pacote.userId
      });
    }
  } catch (error) {
    console.error('Erro ao verificar pacotes diários:', error);
    throw error;
  }
}

async function gerarFigurinhasParaPacote(pacoteId: string, userId: string) {
  try {
    console.log(`Iniciando geração de figurinhas para pacote ${pacoteId} do usuário ${userId}`);
    
    // Buscar todos os jogadores com seus dados e times
    const jogadores = await prisma.jogador.findMany({
      include: {
        time: true
      }
    });

    if (jogadores.length === 0) {
      console.error('Nenhum jogador encontrado no banco de dados');
      throw new Error('Nenhum jogador encontrado no banco de dados');
    }

    console.log(`Total de jogadores encontrados: ${jogadores.length}`);

    // Selecionar 4 jogadores aleatórios
    const jogadoresSelecionados: (typeof jogadores[0])[] = [];
    const jogadoresDisponiveis = [...jogadores]; // Cria uma cópia para não modificar o array original

    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
      if (jogadoresDisponiveis.length === 0) {
        console.error('Não há mais jogadores disponíveis para seleção');
        throw new Error('Não há mais jogadores disponíveis para seleção');
      }

      const randomIndex = Math.floor(Math.random() * jogadoresDisponiveis.length);
      const jogador = jogadoresDisponiveis[randomIndex];
      jogadoresSelecionados.push(jogador);
      jogadoresDisponiveis.splice(randomIndex, 1); // Remove o jogador selecionado para evitar duplicatas
    }

    console.log('Jogadores selecionados:', jogadoresSelecionados.map(j => j.nome));

    const figurinhasCriadas: Awaited<ReturnType<typeof prisma.figurinha.create>>[] = [];

    // Criar as figurinhas uma por uma dentro de uma transação
    await prisma.$transaction(async (tx) => {
      for (const jogador of jogadoresSelecionados) {
        console.log(`Criando figurinha para jogador: ${jogador.nome}`);
        
        // Criar a figurinha
        const figurinha = await tx.figurinha.create({
          data: {
            nome: jogador.nome,
            numero: jogador.numero,
            posicao: jogador.posicao,
            nacionalidade: jogador.nacionalidade,
            foto: jogador.foto,
            timeId: jogador.timeId,
            jogadorId: jogador.id,
            pacoteId: pacoteId,
            raridade: jogador.raridade // Adiciona a raridade do jogador
          }
        });

        console.log('Figurinha criada:', {
          id: figurinha.id,
          nome: figurinha.nome,
          raridade: figurinha.raridade
        });

        // Criar a relação com o usuário
        const userFigurinha = await tx.userFigurinha.create({
          data: {
            userId: userId,
            figurinhaId: figurinha.id,
            quantidade: 1,
            nomeJogador: jogador.nome || '',
            nomeTime: jogador.time?.nome || '',
          }
        });

        console.log('UserFigurinha criada:', {
          id: userFigurinha.id,
          userId: userFigurinha.userId,
          figurinhaId: userFigurinha.figurinhaId
        });

        figurinhasCriadas.push(figurinha);
      }
    });

    console.log(`${figurinhasCriadas.length} figurinhas criadas com sucesso para o pacote ${pacoteId}`);
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

export async function criarPacoteDiario(userId: string) {
  return prisma.pacote.create({
    data: {
      userId,
      tipo: TipoPacote.DIARIO,
      aberto: false
    }
  });
}

export async function criarPacoteInicial(userId: string) {
  return prisma.pacote.create({
    data: {
      userId,
      tipo: TipoPacote.INICIAL,
      aberto: false
    }
  });
}

export async function getPacotesDoUsuario(userId: string) {
  return prisma.pacote.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function abrirPacote(pacoteId: string) {
  return prisma.pacote.update({
    where: { id: pacoteId },
    data: { aberto: true }
  });
} 