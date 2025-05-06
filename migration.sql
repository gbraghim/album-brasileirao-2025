-- Criar uma transação para garantir que todas as alterações sejam feitas juntas
BEGIN;

-- Criar o tipo enum se ele não existir
DO $$ BEGIN
    CREATE TYPE "TipoPacote" AS ENUM ('COMPRADO', 'DIARIO', 'INICIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar uma coluna temporária do novo tipo
ALTER TABLE "Pacote" ADD COLUMN "tipo_novo" "TipoPacote";

-- Preencher a coluna temporária com os valores convertidos
UPDATE "Pacote" 
SET "tipo_novo" = CASE 
    WHEN "tipo" = 'DIARIO' THEN 'DIARIO'::"TipoPacote"
    ELSE 'INICIAL'::"TipoPacote"
END;

-- Remover a coluna antiga e renomear a nova
ALTER TABLE "Pacote" DROP COLUMN "tipo";
ALTER TABLE "Pacote" RENAME COLUMN "tipo_novo" TO "tipo";

-- Adicionar NOT NULL e DEFAULT
ALTER TABLE "Pacote" ALTER COLUMN "tipo" SET NOT NULL;
ALTER TABLE "Pacote" ALTER COLUMN "tipo" SET DEFAULT 'INICIAL'::"TipoPacote";

COMMIT; 