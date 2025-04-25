-- Adicionar coluna raridade à tabela Jogador
ALTER TABLE "Jogador" ADD COLUMN IF NOT EXISTS "raridade" TEXT DEFAULT 'Bronze';

-- Adicionar coluna raridade à tabela Figurinha
ALTER TABLE "Figurinha" ADD COLUMN IF NOT EXISTS "raridade" TEXT DEFAULT 'Bronze';

-- Atualizar registros existentes
UPDATE "Jogador" SET "raridade" = 'Bronze' WHERE "raridade" IS NULL;
UPDATE "Figurinha" SET "raridade" = 'Bronze' WHERE "raridade" IS NULL; 