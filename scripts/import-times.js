const ExcelJS = require('exceljs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importTimes() {
  try {
    const filePath = path.join(__dirname, '..', 'popular_times.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    const data = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Pula o cabeçalho
        data.push({
          nome: row.getCell(1).value,
          escudo: row.getCell(2).value,
          apiId: row.getCell(3).value
        });
      }
    });

    console.log('Dados lidos do Excel:', data);

    // Insere os times no banco de dados
    for (const row of data) {
      // Acessa as colunas pelos nomes corretos do Excel
      const time = {
        id: row['id'].toString(), // ID é a coluna 'id'
        nome: row['nome'], // Nome é a coluna 'nome'
        apiId: parseInt(row['id']) // apiId é o mesmo número do id
      };

      console.log('Processando time:', time);

      if (!time.id || !time.nome || !time.apiId) {
        console.error('Dados inválidos:', row);
        continue;
      }

      await prisma.time.create({
        data: time
      });

      console.log(`Time ${time.nome} importado com sucesso!`);
    }

    console.log('Importação concluída!');
  } catch (error) {
    console.error('Erro ao importar times:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importTimes(); 