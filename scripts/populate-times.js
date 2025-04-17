const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const times = [
    {
      nome: 'América-MG',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/america-mineiro',
      apiId: 1
    },
    {
      nome: 'Athletico-PR',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/atletico-paranaense',
      apiId: 2
    },
    {
      nome: 'Atlético-MG',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/atletico-mineiro',
      apiId: 3
    },
    {
      nome: 'Bahia',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/bahia',
      apiId: 4
    },
    {
      nome: 'Botafogo',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/botafogo',
      apiId: 5
    },
    {
      nome: 'Corinthians',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/corinthians',
      apiId: 6
    },
    {
      nome: 'Coritiba',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/coritiba',
      apiId: 7
    },
    {
      nome: 'Cruzeiro',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/cruzeiro',
      apiId: 8
    },
    {
      nome: 'Cuiabá',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/cuiaba',
      apiId: 9
    },
    {
      nome: 'Flamengo',
      escudo: 'C:\Users\Braghinho\album-brasileirao-2025\scripts',
      apiId: 10
    },
    {
      nome: 'Fluminense',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/fluminense',
      apiId: 11
    },
    {
      nome: 'Fortaleza',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/fortaleza',
      apiId: 12
    },
    {
      nome: 'Goiás',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/goias',
      apiId: 13
    },
    {
      nome: 'Grêmio',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/gremio',
      apiId: 14
    },
    {
      nome: 'Internacional',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/internacional',
      apiId: 15
    },
    {
      nome: 'Palmeiras',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/palmeiras',
      apiId: 16
    },
    {
      nome: 'Red Bull Bragantino',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/red-bull-bragantino',
      apiId: 17
    },
    {
      nome: 'Santos',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/santos',
      apiId: 18
    },
    {
      nome: 'São Paulo',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/sao-paulo',
      apiId: 19
    },
    {
      nome: 'Vasco',
      escudo: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/vasco',
      apiId: 20
    }
  ];

  for (const time of times) {
    try {
      const timeExistente = await prisma.time.findUnique({
        where: { apiId: time.apiId }
      });

      if (!timeExistente) {
        await prisma.time.create({
          data: time
        });
        console.log(`Time ${time.nome} criado com sucesso!`);
      } else {
        console.log(`Time ${time.nome} já existe no banco de dados.`);
      }
    } catch (error) {
      console.error(`Erro ao criar time ${time.nome}:`, error);
    }
  }

  console.log('Processo de população dos times concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 