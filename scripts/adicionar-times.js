import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function adicionarTimes() {
  try {
    const novosTimes = [
      { nome: 'Atlético Goianiense', escudo: 'https://img.a.transfermarkt.technology/portrait/medium/176555-1676562433.jpg?lm=1', apiId: 21 },
      { nome: 'Cuiabá EC', escudo: 'https://img.a.transfermarkt.technology/portrait/medium/176555-1676562433.jpg?lm=1', apiId: 22 }
    ];

    for (const time of novosTimes) {
      const timeExistente = await prisma.time.findFirst({
        where: { nome: time.nome }
      });

      if (!timeExistente) {
        const novoTime = await prisma.time.create({
          data: {
            nome: time.nome,
            escudo: time.escudo,
            apiId: time.apiId
          }
        });
        console.log(`Time ${time.nome} adicionado com sucesso! ID: ${novoTime.id}`);
      } else {
        console.log(`Time ${time.nome} já existe! ID: ${timeExistente.id}`);
      }
    }
  } catch (error) {
    console.error('Erro ao adicionar times:', error);
  } finally {
    await prisma.$disconnect();
  }
}

adicionarTimes(); 