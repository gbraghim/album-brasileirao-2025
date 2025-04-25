const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function corrigirRaridade() {
  try {
    await client.connect();
    
    // Corrigir raridade dos jogadores
    const jogadoresResult = await client.query(`
      UPDATE "Jogador" 
      SET "raridade" = 'Bronze' 
      WHERE "raridade" IS NULL OR "raridade" = 'undefined';
    `);

    // Corrigir raridade das figurinhas
    const figurinhasResult = await client.query(`
      UPDATE "Figurinha" 
      SET "raridade" = 'Bronze' 
      WHERE "raridade" IS NULL OR "raridade" = 'undefined';
    `);

    // Verificar total de registros com raridade Bronze
    const jogadoresTotal = await client.query(`
      SELECT COUNT(*) as total FROM "Jogador" WHERE "raridade" = 'Bronze';
    `);

    const figurinhasTotal = await client.query(`
      SELECT COUNT(*) as total FROM "Figurinha" WHERE "raridade" = 'Bronze';
    `);

    console.log('Dados atualizados com sucesso!');
    console.log('Total de jogadores com raridade Bronze:', jogadoresTotal.rows[0].total);
    console.log('Total de figurinhas com raridade Bronze:', figurinhasTotal.rows[0].total);

  } catch (error) {
    console.error('Erro ao corrigir raridade:', error);
  } finally {
    await client.end();
  }
}

corrigirRaridade(); 