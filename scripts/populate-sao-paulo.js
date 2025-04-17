const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Primeiro, vamos verificar se o São Paulo já existe
  let saoPaulo = await prisma.time.findUnique({
    where: {
      apiId: 3
    }
  });

  // Se não existir, vamos criar
  if (!saoPaulo) {
    saoPaulo = await prisma.time.create({
      data: {
        nome: 'São Paulo',
        escudo: 'https://logodetimes.com/times/sao-paulo/sao-paulo-256.png',
        apiId: 3,
      },
    });
    console.log('Time do São Paulo criado com sucesso!');
  } else {
    console.log('Time do São Paulo já existe no banco de dados.');
  }

  // Agora vamos criar os jogadores do São Paulo
  const jogadores = [
    // Goleiros
    {
      nome: 'Rafael',
      numero: 1,
      posicao: 'Goleiro',
      idade: 33,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/rafael.png',
      apiId: 42,
    },
    {
      nome: 'Jandrei',
      numero: 23,
      posicao: 'Goleiro',
      idade: 30,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/jandrei.png',
      apiId: 43,
    },
    // Defensores
    {
      nome: 'Rafinha',
      numero: 2,
      posicao: 'Lateral Direito',
      idade: 38,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/rafinha.png',
      apiId: 44,
    },
    {
      nome: 'Igor Vinícius',
      numero: 13,
      posicao: 'Lateral Direito',
      idade: 26,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/igor_vinicius.png',
      apiId: 45,
    },
    {
      nome: 'Arboleda',
      numero: 5,
      posicao: 'Zagueiro',
      idade: 32,
      nacionalidade: 'Equatoriano',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/arboleda.png',
      apiId: 46,
    },
    {
      nome: 'Diego Costa',
      numero: 28,
      posicao: 'Zagueiro',
      idade: 24,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/diego_costa.png',
      apiId: 47,
    },
    {
      nome: 'Beraldo',
      numero: 35,
      posicao: 'Zagueiro',
      idade: 19,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/beraldo.png',
      apiId: 48,
    },
    {
      nome: 'Welington',
      numero: 6,
      posicao: 'Lateral Esquerdo',
      idade: 25,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/welington.png',
      apiId: 49,
    },
    // Meio-campistas
    {
      nome: 'Pablo Maia',
      numero: 29,
      posicao: 'Meio-campo',
      idade: 21,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/pablo_maia.png',
      apiId: 50,
    },
    {
      nome: 'Alisson',
      numero: 25,
      posicao: 'Meio-campo',
      idade: 25,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/alisson.png',
      apiId: 51,
    },
    {
      nome: 'Luciano',
      numero: 10,
      posicao: 'Meio-campo',
      idade: 30,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/luciano.png',
      apiId: 52,
    },
    {
      nome: 'Rodrigo Nestor',
      numero: 15,
      posicao: 'Meio-campo',
      idade: 23,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/rodrigo_nestor.png',
      apiId: 53,
    },
    // Atacantes
    {
      nome: 'Jonathan Calleri',
      numero: 9,
      posicao: 'Atacante',
      idade: 29,
      nacionalidade: 'Argentino',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/jonathan_calleri.png',
      apiId: 54,
    },
    {
      nome: 'Lucas Moura',
      numero: 7,
      posicao: 'Atacante',
      idade: 30,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/lucas_moura.png',
      apiId: 55,
    },
    {
      nome: 'Wellington Rato',
      numero: 11,
      posicao: 'Atacante',
      idade: 30,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/wellington_rato.png',
      apiId: 56,
    },
    {
      nome: 'Giuliano Galoppo',
      numero: 14,
      posicao: 'Atacante',
      idade: 24,
      nacionalidade: 'Argentino',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/giuliano_galoppo.png',
      apiId: 57,
    }
  ];

  // Criar os jogadores no banco de dados
  for (const jogador of jogadores) {
    // Verificar se o jogador já existe
    const jogadorExistente = await prisma.jogador.findUnique({
      where: {
        apiId: jogador.apiId
      }
    });

    if (!jogadorExistente) {
      await prisma.jogador.create({
        data: {
          ...jogador,
          timeId: saoPaulo.id,
        },
      });
      console.log(`Jogador ${jogador.nome} criado com sucesso!`);
    } else {
      console.log(`Jogador ${jogador.nome} já existe no banco de dados.`);
    }
  }

  console.log('Processo de população do elenco do São Paulo concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 