import { PrismaClient, NotificacaoTipo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando migração de notificações...');

  // Criar a tabela Notificacao se não existir
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Notificacao" (
      id TEXT PRIMARY KEY,
      mensagem TEXT NOT NULL,
      lida BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "usuarioId" TEXT NOT NULL,
      "trocaId" TEXT,
      tipo "NotificacaoTipo" NOT NULL,
      "tipoNovo" "TipoNotificacao",
      FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE,
      FOREIGN KEY ("trocaId") REFERENCES "Troca"("id") ON DELETE CASCADE
    );
  `;

  // Criar o enum TipoNotificacao se não existir
  await prisma.$executeRaw`
    DO $$ BEGIN
      CREATE TYPE "TipoNotificacao" AS ENUM (
        'TROCA_ACEITA',
        'TROCA_RECUSADA',
        'TROCA_FINALIZADA',
        'TROCA_CANCELADA',
        'PACOTE_ABERTO',
        'FIGURINHA_NOVA'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  console.log('Migração concluída!');
}

main()
  .catch((e) => {
    console.error('Erro durante a migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 