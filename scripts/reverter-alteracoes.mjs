import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reverterAlteracoes() {
  try {
    // Remover times adicionados incorretamente
    await prisma.time.deleteMany({
      where: {
        nome: {
          in: ['Atlético Goianiense', 'Cuiabá EC']
        }
      }
    });

    // Remover todos os jogadores
    await prisma.jogador.deleteMany();

    console.log('Alterações revertidas com sucesso!');
  } catch (erro) {
    console.error('Erro ao reverter alterações:', erro);
  } finally {
    await prisma.$disconnect();
  }
}

reverterAlteracoes(); 