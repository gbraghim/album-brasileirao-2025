-- Atualizar raridade de Bronze para Prata na tabela Jogador
UPDATE "Jogador" 
SET "raridade" = 'Prata'
WHERE "raridade" = 'Bronze';

-- Atualizar raridade de Bronze para Prata na tabela Figurinha
UPDATE "Figurinha" 
SET "raridade" = 'Prata'
WHERE "raridade" = 'Bronze';

-- Verificar quantidade de registros atualizados
SELECT COUNT(*) as total_jogadores_atualizados FROM "Jogador" WHERE "raridade" = 'Prata';
SELECT COUNT(*) as total_figurinhas_atualizadas FROM "Figurinha" WHERE "raridade" = 'Prata'; 