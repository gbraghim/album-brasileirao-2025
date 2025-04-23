import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listarTimes() {
  try {
    const times = await prisma.time.findMany();
    console.log('Times encontrados:');
    times.forEach(time => {
      console.log(`ID: ${time.id}, Nome: ${time.nome}`);
    });
  } catch (error) {
    console.error('Erro ao buscar times:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listarTimes(); 