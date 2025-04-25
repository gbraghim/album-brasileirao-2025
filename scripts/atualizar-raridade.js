const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function atualizarRaridade() {
  try {
    // Executar SQL diretamente usando Prisma
    await prisma.$executeRawUnsafe('ALTER TABLE "Jogador" ADD COLUMN IF NOT EXISTS "raridade" TEXT DEFAULT \'Bronze\'');
    await prisma.$executeRawUnsafe('ALTER TABLE "Figurinha" ADD COLUMN IF NOT EXISTS "raridade" TEXT DEFAULT \'Bronze\'');
    
    await prisma.$executeRawUnsafe('UPDATE "Jogador" SET "raridade" = \'Bronze\' WHERE "raridade" IS NULL');
    await prisma.$executeRawUnsafe('UPDATE "Figurinha" SET "raridade" = \'Bronze\' WHERE "raridade" IS NULL');

    console.log('Colunas adicionadas e dados atualizados com sucesso!');

  } catch (error) {
    console.error('Erro ao atualizar raridade:', error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarRaridade(); 