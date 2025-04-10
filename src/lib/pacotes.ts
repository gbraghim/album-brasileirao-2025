import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { Jogador } from '@prisma/client';

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
    // Verifica se o usuário já recebeu os pacotes iniciais
    const pacotesIniciais = await prisma.pacote.findMany({
      where: {
        userId,
        tipo: 'CADASTRO'
      }
    });

    // Se não houver pacotes iniciais, cria 10 pacotes
    if (pacotesIniciais.length === 0) {
      for (let i = 0; i < 10; i++) {
        const pacote = await prisma.pacote.create({
          data: {
            userId,
            tipo: 'CADASTRO',
            aberto: false
          }
        });
        
        await gerarFigurinhasParaPacote(pacote.id, userId);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar pacotes iniciais:', error);
    throw error;
  }
}

// Verifica e cria pacotes diários
export async function verificarPacotesDiarios(userId: string) {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Verifica se o usuário já recebeu os pacotes diários hoje
    const pacotesDiarios = await prisma.pacote.findMany({
      where: {
        userId,
        tipo: 'DIARIO',
        createdAt: {
          gte: hoje
        }
      }
    });

    // Se não houver pacotes diários hoje, cria 3 pacotes
    if (pacotesDiarios.length === 0) {
      for (let i = 0; i < 3; i++) {
        const pacote = await prisma.pacote.create({
          data: {
            userId,
            tipo: 'DIARIO',
            aberto: false
          }
        });
        
        await gerarFigurinhasParaPacote(pacote.id, userId);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar pacotes diários:', error);
    throw error;
  }
}

async function gerarFigurinhasParaPacote(pacoteId: string, userId: string) {
  const jogadores: Jogador[] = [];
  
  // Selecionar 4 jogadores aleatórios (podendo repetir)
  for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
    // Pegar um offset aleatório
    const offset = Math.floor(Math.random() * (await prisma.jogador.count()));
    
    // Buscar um jogador aleatório
    const jogador = await prisma.jogador.findFirst({
      skip: offset,
      take: 1
    });
    
    if (jogador) {
      jogadores.push(jogador);
    }
  }
  
  // Criar as figurinhas no pacote
  for (const jogador of jogadores) {
    try {
      // Primeiro criar a figurinha no pacote
      const figurinha = await prisma.figurinha.create({
        data: {
          pacoteId,
          jogadorId: jogador.id
        }
      });

      // Verificar se o usuário já tem a figurinha
      const existingUserFigurinha = await prisma.userFigurinha.findFirst({
        where: {
          userId,
          figurinhaId: figurinha.id
        }
      });

      if (existingUserFigurinha) {
        // Se já tem, incrementa a quantidade
        await prisma.userFigurinha.update({
          where: {
            id: existingUserFigurinha.id
          },
          data: {
            quantidade: existingUserFigurinha.quantidade + 1
          }
        });
      } else {
        // Se não tem, cria uma nova
        await prisma.userFigurinha.create({
          data: {
            userId,
            figurinhaId: figurinha.id,
            quantidade: 1
          }
        });
      }
    } catch (error) {
      console.error('Erro ao processar figurinha para usuário:', error);
      throw error;
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
    await gerarFigurinhasParaPacote(pacote.id, user.id);
  }

  return pacotes.length;
} 