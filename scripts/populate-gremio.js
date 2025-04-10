const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Primeiro, vamos verificar se o Grêmio já existe
  let gremio = await prisma.time.findUnique({
    where: {
      apiId: 4
    }
  });

  // Se não existir, vamos criar
  if (!gremio) {
    gremio = await prisma.time.create({
      data: {
        nome: 'Grêmio',
        escudo: 'https://logodetimes.com/times/gremio/gremio-256.png',
        apiId: 4,
      },
    });
    console.log('Time do Grêmio criado com sucesso!');
  } else {
    console.log('Time do Grêmio já existe no banco de dados.');
  }

  // Agora vamos criar os jogadores do Grêmio
  const jogadores = [
    // Goleiros
    {
      nome: 'Gabriel Grando',
      numero: 1,
      posicao: 'Goleiro',
      idade: 23,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/gabriel_grando.png',
      apiId: 58,
    },
    {
      nome: 'Breno',
      numero: 12,
      posicao: 'Goleiro',
      idade: 24,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/breno.png',
      apiId: 59,
    },
    // Defensores
    {
      nome: 'Fábio',
      numero: 2,
      posicao: 'Lateral Direito',
      idade: 30,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/fabio.png',
      apiId: 60,
    },
    {
      nome: 'João Pedro',
      numero: 13,
      posicao: 'Lateral Direito',
      idade: 24,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/joao_pedro.png',
      apiId: 61,
    },
    {
      nome: 'Bruno Alves',
      numero: 3,
      posicao: 'Zagueiro',
      idade: 36,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/bruno_alves.png',
      apiId: 62,
    },
    {
      nome: 'Kannemann',
      numero: 4,
      posicao: 'Zagueiro',
      idade: 32,
      nacionalidade: 'Uruguaio',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/kannemann.png',
      apiId: 63,
    },
    {
      nome: 'Geromel',
      numero: 15,
      posicao: 'Zagueiro',
      idade: 37,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/geromel.png',
      apiId: 64,
    },
    {
      nome: 'Reinaldo',
      numero: 6,
      posicao: 'Lateral Esquerdo',
      idade: 30,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/reinaldo.png',
      apiId: 65,
    },
    // Meio-campistas
    {
      nome: 'Villasanti',
      numero: 5,
      posicao: 'Meio-campo',
      idade: 22,
      nacionalidade: 'Paraguaio',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/villasanti.png',
      apiId: 66,
    },
    {
      nome: 'Carballo',
      numero: 8,
      posicao: 'Meio-campo',
      idade: 24,
      nacionalidade: 'Uruguaio',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/carballo.png',
      apiId: 67,
    },
    {
      nome: 'Bitello',
      numero: 10,
      posicao: 'Meio-campo',
      idade: 23,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/bitello.png',
      apiId: 68,
    },
    {
      nome: 'Cristaldo',
      numero: 14,
      posicao: 'Meio-campo',
      idade: 24,
      nacionalidade: 'Argentino',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/cristaldo.png',
      apiId: 69,
    },
    // Atacantes
    {
      nome: 'Luis Suárez',
      numero: 9,
      posicao: 'Atacante',
      idade: 36,
      nacionalidade: 'Uruguaio',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/luis_suarez.png',
      apiId: 70,
    },
    {
      nome: 'Ferreira',
      numero: 7,
      posicao: 'Atacante',
      idade: 24,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/ferreira.png',
      apiId: 71,
    },
    {
      nome: 'Vina',
      numero: 11,
      posicao: 'Atacante',
      idade: 25,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/vina.png',
      apiId: 72,
    },
    {
      nome: 'Nathan',
      numero: 17,
      posicao: 'Atacante',
      idade: 22,
      nacionalidade: 'Brasileiro',
      foto: 'https://s.glbimg.com/es/sde/f/2023/05/10/nathan.png',
      apiId: 73,
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
          timeId: gremio.id,
        },
      });
      console.log(`Jogador ${jogador.nome} criado com sucesso!`);
    } else {
      console.log(`Jogador ${jogador.nome} já existe no banco de dados.`);
    }
  }

  console.log('Processo de população do elenco do Grêmio concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 