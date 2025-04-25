import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar todos os times com seus jogadores
    const times = await prisma.time.findMany({
      include: {
        jogadores: {
          orderBy: {
            nome: 'asc'
          }
        }
      }
    });

    // Listar jogadores de cada time
    for (const time of times) {
      console.log(`\nTime: ${time.nome}`);
      console.log('Jogadores:');
      time.jogadores.forEach(jogador => {
        console.log(`- ${jogador.nome} (${jogador.posicao || 'Sem posição'})`);
      });
    }
  } catch (error) {
    console.error('Erro ao listar jogadores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 