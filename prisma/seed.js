const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TIMES = [
  {
    nome: 'Flamengo',
    escudo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/819.png',
    apiId: 1
  },
  {
    nome: 'Palmeiras',
    escudo: 'https://logodetimes.com/times/palmeiras/palmeiras-256.png',
    apiId: 2
  },
  {
    nome: 'Atlético-MG',
    escudo: 'https://logodetimes.com/times/atletico-mineiro/atletico-mineiro-256.png',
    apiId: 3
  },
  {
    nome: 'Corinthians',
    escudo: 'https://logodetimes.com/times/corinthians/corinthians-256.png',
    apiId: 4
  },
  {
    nome: 'São Paulo',
    escudo: 'https://logodetimes.com/times/sao-paulo/sao-paulo-256.png',
    apiId: 5
  },
  {
    nome: 'Santos',
    escudo: 'https://logodetimes.com/times/santos/santos-256.png',
    apiId: 6
  },
  {
    nome: 'Grêmio',
    escudo: 'https://logodetimes.com/times/gremio/gremio-256.png',
    apiId: 7
  },
  {
    nome: 'Internacional',
    escudo: 'https://logodetimes.com/times/internacional/internacional-256.png',
    apiId: 8
  },
  {
    nome: 'Fluminense',
    escudo: 'https://logodetimes.com/times/fluminense/fluminense-256.png',
    apiId: 9
  },
  {
    nome: 'Botafogo',
    escudo: 'https://logodetimes.com/times/botafogo/botafogo-256.png',
    apiId: 10
  },
  {
    nome: 'Vasco',
    escudo: 'https://logodetimes.com/times/vasco/vasco-256.png',
    apiId: 11
  },
  {
    nome: 'Cruzeiro',
    escudo: 'https://logodetimes.com/times/cruzeiro/cruzeiro-256.png',
    apiId: 12
  },
  {
    nome: 'Athletico-PR',
    escudo: 'https://logodetimes.com/times/athletico-paranaense/athletico-paranaense-256.png',
    apiId: 13
  },
  {
    nome: 'Bahia',
    escudo: 'https://logodetimes.com/times/bahia/bahia-256.png',
    apiId: 14
  },
  {
    nome: 'Fortaleza',
    escudo: 'https://logodetimes.com/times/fortaleza/fortaleza-256.png',
    apiId: 15
  },
  {
    nome: 'Ceará',
    escudo: 'https://logodetimes.com/times/ceara/ceara-256.png',
    apiId: 16
  },
  {
    nome: 'Sport',
    escudo: 'https://logodetimes.com/times/sport/sport-256.png',
    apiId: 17
  },
  {
    nome: 'Goiás',
    escudo: 'https://logodetimes.com/times/goias/goias-256.png',
    apiId: 18
  },
  {
    nome: 'Coritiba',
    escudo: 'https://logodetimes.com/times/coritiba/coritiba-256.png',
    apiId: 19
  },
  {
    nome: 'Bragantino',
    escudo: 'https://logodetimes.com/times/red-bull-bragantino/red-bull-bragantino-256.png',
    apiId: 20
  }
];

const POSICOES = ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-campo', 'Atacante'];

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar o banco de dados
  await prisma.userFigurinha.deleteMany();
  await prisma.figurinha.deleteMany();
  await prisma.pacote.deleteMany();
  await prisma.jogador.deleteMany();
  await prisma.time.deleteMany();

  // Criar times
  for (const time of TIMES) {
    await prisma.time.create({
      data: {
        ...time,
        jogadores: {
          create: Array.from({ length: 25 }, (_, i) => ({
            nome: `Jogador ${i + 1} ${time.nome}`,
            numero: i + 1,
            posicao: POSICOES[Math.floor(Math.random() * POSICOES.length)],
            idade: Math.floor(Math.random() * 20) + 18,
            nacionalidade: 'Brasileiro',
            foto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${time.nome}-${i + 1}`,
            apiId: time.apiId * 100 + i + 1
          }))
        }
      }
    });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 