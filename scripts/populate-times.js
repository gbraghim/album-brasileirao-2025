const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const times = [
    {
      nome: 'América-MG',
      estado: 'MG',
      escudo: '/escudos/america-mineiro.png',
      apiId: 1
    },
    {
      nome: 'Athletico-PR',
      estado: 'PR',
      escudo: '/escudos/atletico-paranaense.png',
      apiId: 2
    },
    {
      nome: 'Atlético-MG',
      estado: 'MG',
      escudo: '/escudos/atletico_mg.png',
      apiId: 3
    },
    {
      nome: 'Bahia',
      estado: 'BA',
      escudo: '/escudos/bahia.png',
      apiId: 4
    },
    {
      nome: 'Botafogo',
      estado: 'RJ',
      escudo: '/escudos/botafogo.png',
      apiId: 5
    },
    {
      nome: 'Corinthians',
      estado: 'SP',
      escudo: '/escudos/corinthians.png',
      apiId: 6
    },
    {
      nome: 'Coritiba',
      estado: 'PR',
      escudo: '/escudos/coritiba.png',
      apiId: 7
    },
    {
      nome: 'Cruzeiro',
      estado: 'MG',
      escudo: '/escudos/cruzeiro.png',
      apiId: 8
    },
    {
      nome: 'Cuiabá',
      estado: 'MT',
      escudo: '/escudos/cuiaba.png',
      apiId: 9
    },
    {
      nome: 'Flamengo',
      estado: 'RJ',
      escudo: '/escudos/flamengo.png',
      apiId: 10
    },
    {
      nome: 'Fluminense',
      estado: 'RJ',
      escudo: '/escudos/fluminense.png',
      apiId: 11
    },
    {
      nome: 'Fortaleza',
      estado: 'CE',
      escudo: '/escudos/fortaleza.png',
      apiId: 12
    },
    {
      nome: 'Goiás',
      estado: 'GO',
      escudo: '/escudos/goias.png',
      apiId: 13
    },
    {
      nome: 'Grêmio',
      estado: 'RS',
      escudo: '/escudos/gremio.png',
      apiId: 14
    },
    {
      nome: 'Internacional',
      estado: 'RS',
      escudo: '/escudos/internacional.png',
      apiId: 15
    },
    {
      nome: 'Palmeiras',
      estado: 'SP',
      escudo: '/escudos/palmeiras.png',
      apiId: 16
    },
    {
      nome: 'Bragantino',
      estado: 'SP',
      escudo: '/escudos/Bragantino.jpg',
      apiId: 17
    },
    {
      nome: 'Santos',
      estado: 'SP',
      escudo: '/escudos/santos.png',
      apiId: 18
    },
    {
      nome: 'São Paulo',
      estado: 'SP',
      escudo: '/escudos/sao_paulo.png',
      apiId: 19
    },
    {
      nome: 'Vasco',
      estado: 'RJ',
      escudo: '/escudos/vasco.png',
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