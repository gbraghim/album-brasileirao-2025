const { PrismaClient } = require('@prisma/client');

async function listarTimes() {
  const prisma = new PrismaClient();
  try {
    const times = await prisma.time.findMany();
    console.log('Times encontrados:');
    times.forEach(time => {
      console.log(`ID: ${time.id}, Nome: ${time.nome}`);
    });
  } catch (error) {
    console.error('Erro ao listar times:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listarTimes(); 