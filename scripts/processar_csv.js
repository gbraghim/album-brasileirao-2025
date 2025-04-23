import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function processarCsv() {
  try {
    // Limpar registros existentes
    await prisma.jogador.deleteMany();
    
    // Ler arquivo CSV
    const conteudo = fs.readFileSync('jogadores_importacao.csv', 'utf-8');
    const registros = parse(conteudo, {
      columns: true,
      skip_empty_lines: true
    });

    // Buscar todos os times
    const times = await prisma.time.findMany();
    const mapaTimes = new Map(times.map(time => [time.nome, time.id]));

    let apiIdCounter = 1;
    
    // Processar cada registro
    for (const registro of registros) {
      try {
        // Converter número para inteiro
        let numero = null;
        if (registro.numero && registro.numero !== '-') {
          numero = parseInt(registro.numero, 10);
          if (isNaN(numero)) {
            console.log(`Número inválido para jogador ${registro.nome}: ${registro.numero}`);
            continue;
          }
        }

        // Encontrar ID do time
        const timeId = mapaTimes.get(registro.Time);
        if (!timeId) {
          console.log(`Time não encontrado: ${registro.Time} para jogador ${registro.nome}`);
          continue;
        }

        // Criar jogador
        await prisma.jogador.create({
          data: {
            nome: registro.nome.trim(),
            numero: numero,
            posicao: registro.posicao.trim(),
            nacionalidade: registro.nacionalidade.trim(),
            foto: registro.foto.trim(),
            apiId: apiIdCounter++,
            timeId: timeId
          }
        });

      } catch (erro) {
        console.log(`Erro ao processar jogador ${registro.nome} do time ${registro.Time}:`, erro);
      }
    }

    console.log('Importação concluída! Total de jogadores importados:', apiIdCounter - 1);

  } catch (erro) {
    console.error('Erro ao processar CSV:', erro);
  } finally {
    await prisma.$disconnect();
  }
}

processarCsv(); 