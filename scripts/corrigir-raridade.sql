-- Corrigir raridade dos jogadores
UPDATE "Jogador" 
SET "raridade" = 'Bronze' 
WHERE "raridade" IS NULL OR "raridade" = 'undefined';

-- Corrigir raridade das figurinhas
UPDATE "Figurinha" 
SET "raridade" = 'Bronze' 
WHERE "raridade" IS NULL OR "raridade" = 'undefined';

-- Verificar quantidade de registros atualizados
SELECT COUNT(*) as total_jogadores FROM "Jogador" WHERE "raridade" = 'Bronze';
SELECT COUNT(*) as total_figurinhas FROM "Figurinha" WHERE "raridade" = 'Bronze'; 