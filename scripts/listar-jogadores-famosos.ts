import { prisma } from '../src/lib/prisma';

async function listarJogadoresFamosos() {
  const times = await prisma.time.findMany({
    include: {
      jogadores: {
        where: {
          nome: {
            contains: 'Lendário'
          }
        }
      }
    }
  });

  for (const time of times) {
    console.log(`\nTime: ${time.nome}`);
    console.log('Jogadores Lendários:');
    for (const jogador of time.jogadores) {
      console.log(`- ${jogador.nome} (${jogador.posicao})`);
    }
  }
}

listarJogadoresFamosos()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 