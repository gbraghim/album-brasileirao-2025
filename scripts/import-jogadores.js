const ExcelJS = require('exceljs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function gerarNumeroAleatorio() {
  // Gera um número aleatório entre 2 e 99
  return Math.floor(Math.random() * (99 - 2 + 1)) + 2;
}

async function importJogadores() {
  try {
    const filePath = path.join(__dirname, '..', 'popular_jogadores.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    const data = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Pula o cabeçalho
        data.push({
          nome: row.getCell(1).value,
          numero: row.getCell(2).value,
          posicao: row.getCell(3).value,
          nacionalidade: row.getCell(4).value,
          apiId: row.getCell(5).value,
          timeId: row.getCell(6).value,
          foto: row.getCell(7).value
        });
      }
    });

    console.log('Dados lidos do Excel:', data);

    // Insere os jogadores no banco de dados
    for (const [index, row] of data.entries()) {
      // Busca o time pelo nome
      const time = await prisma.time.findFirst({
        where: {
          nome: row['Time']
        }
      });

      if (!time) {
        console.error(`Time não encontrado: ${row['Time']}`);
        continue;
      }

      // Trata o número do jogador
      let numero = row['Número'];
      if (numero === '-' || !numero) {
        numero = gerarNumeroAleatorio();
        console.log(`Número aleatório gerado para ${row['Nome']}: ${numero}`);
      } else {
        numero = parseInt(numero);
      }

      // Gera um apiId único para o jogador
      const apiId = time.apiId * 1000 + index + 1;

      const jogador = {
        nome: row.nome,
        numero: Number(row.numero) || null,
        posicao: row.posicao,
        nacionalidade: row.nacionalidade,
        foto: row.foto,
        apiId: apiId,
        timeId: time.id
      };

      console.log('Processando jogador:', jogador);

      if (!jogador.nome || !jogador.posicao) {
        console.error('Dados inválidos:', row);
        continue;
      }

      // Verificar se o jogador já existe
      const jogadorExistente = await prisma.jogador.findUnique({
        where: {
          apiId: apiId
        }
      });

      if (jogadorExistente) {
        console.log(`Jogador com apiId ${apiId} já existe, atualizando...`);
        await prisma.jogador.update({
          where: {
            apiId: apiId
          },
          data: jogador
        });
      } else {
        console.log(`Criando novo jogador com apiId ${apiId}...`);
        await prisma.jogador.create({
          data: jogador
        });
      }

      console.log(`Jogador ${jogador.nome} importado com sucesso!`);
    }

    console.log('Importação concluída!');
  } catch (error) {
    console.error('Erro ao importar jogadores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importJogadores(); 