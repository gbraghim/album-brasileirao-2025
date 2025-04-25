import { prisma } from '../src/lib/prisma';

async function listarJogadoresNormais() {
  const times = await prisma.time.findMany({
    include: {
      jogadores: {
        where: {
          nome: {
            not: {
              contains: 'Lendário'
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      }
    }
  });

  for (const time of times) {
    console.log(`\nTime: ${time.nome}`);
    console.log('Jogadores:');
    for (const jogador of time.jogadores) {
      console.log(`- ${jogador.nome} (${jogador.posicao})`);
    }
  }
}

listarJogadoresNormais()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 