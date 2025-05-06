const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se a coluna tipoNovo já existe
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Notificacao' AND column_name = 'tipoNovo'
      );
    `;

    if (!columnExists[0].exists) {
      console.log('Adicionando coluna tipoNovo...');
      await prisma.$executeRaw`
        ALTER TABLE "Notificacao" ADD COLUMN "tipoNovo" "NotificacaoTipo";
      `;
    }

    // Atualizar os dados existentes
    console.log('Atualizando dados existentes...');
    await prisma.$executeRaw`
      UPDATE "Notificacao" SET "tipoNovo" = "tipo"::"NotificacaoTipo";
    `;

    // Verificar se todos os registros foram migrados
    const nullCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM "Notificacao" WHERE "tipoNovo" IS NULL;
    `;
    console.log(`Registros não migrados: ${nullCount[0].count}`);

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 