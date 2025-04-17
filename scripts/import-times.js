const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function importTimes() {
  try {
    // Lê o arquivo Excel
    const filePath = path.join(__dirname, '..', 'popular_times.xlsx');
    console.log('Lendo arquivo:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

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