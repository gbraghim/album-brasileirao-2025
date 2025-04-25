-- Script para adicionar jogadores lendários para cada time
DO $$
DECLARE
    time_record RECORD;
    i INTEGER;
    jogador_id TEXT;
    api_id INTEGER;
BEGIN
    -- Loop através de todos os times
    FOR time_record IN SELECT id, nome FROM "Time" LOOP
        -- Para cada time, adicionar 3 jogadores lendários
        FOR i IN 1..3 LOOP
            -- Gerar um ID único para o jogador
            jogador_id := gen_random_uuid()::TEXT;
            -- Gerar um API ID único (usando um número grande para evitar conflitos)
            api_id := 1000000 + (EXTRACT(EPOCH FROM NOW())::INTEGER * 1000) + i;
            
            -- Inserir o jogador lendário
            INSERT INTO "Jogador" (
                id,
                nome,
                numero,
                posicao,
                nacionalidade,
                apiId,
                timeId,
                foto,
                idade,
                raridade
            ) VALUES (
                jogador_id,
                i || 'Lendário' || time_record.nome,
                i, -- número da camisa
                CASE i
                    WHEN 1 THEN 'Atacante'
                    WHEN 2 THEN 'Meio-campo'
                    WHEN 3 THEN 'Zagueiro'
                END,
                'Brasileiro',
                api_id,
                time_record.id,
                '/fotos/jogadores/placeholder.jpg',
                25 + i,
                'Lendário'
            );
        END LOOP;
    END LOOP;
END $$; 