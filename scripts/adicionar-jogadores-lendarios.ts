import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar todos os times
    const times = await prisma.time.findMany();

    // Para cada time, adicionar 3 jogadores lendários
    for (const time of times) {
      for (let i = 1; i <= 3; i++) {
        const nome = `${i}Lendário${time.nome}`;
        const apiId = 1000000 + (i * 1000) + time.apiId;

        await prisma.jogador.create({
          data: {
            nome,
            numero: i,
            posicao: i === 1 ? 'Atacante' : i === 2 ? 'Meio-campo' : 'Zagueiro',
            nacionalidade: 'Brasileiro',
            apiId,
            timeId: time.id,
            foto: '/fotos/jogadores/placeholder.jpg',
            idade: 25 + i,
            raridade: 'Lendário'
          }
        });

        console.log(`Jogador ${nome} criado para o time ${time.nome}`);
      }
    }

    console.log('Todos os jogadores lendários foram criados com sucesso!');
  } catch (error) {
    console.error('Erro ao criar jogadores lendários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 