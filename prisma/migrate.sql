-- Primeiro, criar o enum TipoNotificacao
CREATE TYPE "TipoNotificacao" AS ENUM (
  'TROCA_ACEITA',
  'TROCA_RECUSADA',
  'TROCA_FINALIZADA',
  'TROCA_CANCELADA',
  'PACOTE_ABERTO',
  'FIGURINHA_NOVA'
);

-- Adicionar a nova coluna tipoNovo
ALTER TABLE "Notificacao" ADD COLUMN "tipoNovo" "TipoNotificacao";

-- Atualizar os dados existentes
UPDATE "Notificacao" SET "tipoNovo" = 'TROCA_ACEITA' WHERE "tipo" = 'TROCA_ACEITA';
UPDATE "Notificacao" SET "tipoNovo" = 'TROCA_RECUSADA' WHERE "tipo" = 'TROCA_RECUSADA';
UPDATE "Notificacao" SET "tipoNovo" = 'TROCA_FINALIZADA' WHERE "tipo" = 'TROCA_FINALIZADA';
UPDATE "Notificacao" SET "tipoNovo" = 'TROCA_CANCELADA' WHERE "tipo" = 'TROCA_CANCELADA';
UPDATE "Notificacao" SET "tipoNovo" = 'PACOTE_ABERTO' WHERE "tipo" = 'PACOTE_ABERTO';
UPDATE "Notificacao" SET "tipoNovo" = 'FIGURINHA_NOVA' WHERE "tipo" = 'FIGURINHA_NOVA';

-- Verificar se todos os registros foram migrados
SELECT COUNT(*) FROM "Notificacao" WHERE "tipoNovo" IS NULL;

-- Se todos os registros foram migrados com sucesso, podemos:
-- 1. Remover a coluna antiga
-- 2. Renomear a nova coluna
-- 3. Tornar a coluna obrigatória

-- ALTER TABLE "Notificacao" DROP COLUMN "tipo";
-- ALTER TABLE "Notificacao" RENAME COLUMN "tipoNovo" TO "tipo";
-- ALTER TABLE "Notificacao" ALTER COLUMN "tipo" SET NOT NULL; 