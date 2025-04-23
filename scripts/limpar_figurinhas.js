const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function limparFigurinhas() {
  try {
    console.log('Iniciando limpeza das figurinhas...');

    // 1. Deletar UserFigurinha
    console.log('Deletando UserFigurinha...');
    await prisma.userFigurinha.deleteMany();
    console.log('UserFigurinha deletado com sucesso');

    // 2. Deletar Troca
    console.log('Deletando Troca...');
    await prisma.troca.deleteMany();
    console.log('Troca deletado com sucesso');

    // 3. Deletar TrocaFigurinha
    console.log('Deletando TrocaFigurinha...');
    await prisma.trocaFigurinha.deleteMany();
    console.log('TrocaFigurinha deletado com sucesso');

    // 4. Deletar Figurinha
    console.log('Deletando Figurinha...');
    await prisma.figurinha.deleteMany();
    console.log('Figurinha deletado com sucesso');

    console.log('Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao limpar figurinhas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limparFigurinhas(); 