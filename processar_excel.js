const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function processarExcel() {
  try {
    // Lê o arquivo Excel do Ceará
    const workbook = xlsx.readFile('cearaxlsx.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dados = xlsx.utils.sheet_to_json(sheet);

    // Busca o time Ceará no banco de dados
    const ceara = await prisma.time.findFirst({
      where: {
        nome: 'Ceará'
      }
    });

    if (!ceara) {
      console.log('Time Ceará não encontrado no banco de dados');
      return;
    }

    // Processa cada linha do Excel
    for (const linha of dados) {
      // Gera um apiId aleatório
      const apiId = Math.floor(Math.random() * 1000000);

      // Cria o jogador no banco de dados
      try {
        await prisma.jogador.create({
          data: {
            nome: linha.nome,
            numero: parseInt(linha.numero),
            posicao: linha.posicao,
            nacionalidade: linha.nacionalidade,
            foto: linha.foto || 'default.jpg',
            apiId: apiId,
            timeId: ceara.id
          }
        });
        console.log(`Jogador ${linha.nome} criado com sucesso para o time Ceará`);
      } catch (error) {
        console.error(`Erro ao criar jogador ${linha.nome}:`, error);
      }
    }

    console.log('Processamento concluído!');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

processarExcel(); 