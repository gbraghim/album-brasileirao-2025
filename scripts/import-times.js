import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function importTimes() {
  try {
    // Primeiro, limpa os dados existentes
    await prisma.jogador.deleteMany();
    console.log('Jogadores removidos');
    
    await prisma.time.deleteMany();
    console.log('Times removidos');

    const filePath = path.join(__dirname, '..', 'popular_times.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    const data = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Pula o cabeçalho
        data.push({
          id: row.getCell(1).value,
          nome: row.getCell(2).value,
          escudo: row.getCell(3).value
        });
      }
    });

    console.log('Dados lidos do Excel:', data);

    // Insere os times no banco de dados
    for (const row of data) {
      const time = {
        id: row.id.toString(),
        nome: row.nome,
        apiId: parseInt(row.id)
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