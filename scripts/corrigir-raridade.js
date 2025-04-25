const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function corrigirRaridade() {
  try {
    // Corrigir raridade dos jogadores
    const jogadoresAtualizados = await prisma.$executeRawUnsafe(`
      UPDATE "Jogador" 
      SET "raridade" = 'Bronze' 
      WHERE "raridade" IS NULL OR "raridade" = 'undefined'
    `);

    // Corrigir raridade das figurinhas
    const figurinhasAtualizadas = await prisma.$executeRawUnsafe(`
      UPDATE "Figurinha" 
      SET "raridade" = 'Bronze' 
      WHERE "raridade" IS NULL OR "raridade" = 'undefined'
    `);

    // Verificar quantidade de registros atualizados
    const totalJogadores = await prisma.$executeRawUnsafe(`
      SELECT COUNT(*) as total FROM "Jogador" WHERE "raridade" = 'Bronze'
    `);

    const totalFigurinhas = await prisma.$executeRawUnsafe(`
      SELECT COUNT(*) as total FROM "Figurinha" WHERE "raridade" = 'Bronze'
    `);

    console.log('Dados atualizados com sucesso!');
    console.log('Total de jogadores com raridade Bronze:', totalJogadores[0].total);
    console.log('Total de figurinhas com raridade Bronze:', totalFigurinhas[0].total);

  } catch (error) {
    console.error('Erro ao corrigir raridade:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirRaridade(); 