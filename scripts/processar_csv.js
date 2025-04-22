const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function normalizarNomeTime(nome) {
  // Remove acentos
  return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Remove caracteres especiais e espaços extras
    .replace(/[^\w\s]/g, '')
    // Converte para minúsculas
    .toLowerCase()
    // Remove espaços extras
    .trim();
}

async function processarCSV() {
  try {
    // Limpa os registros existentes
    await prisma.jogador.deleteMany();
    console.log('Registros existentes removidos com sucesso.');

    // Busca todos os times do banco de dados
    const times = await prisma.time.findMany();
    
    // Cria um mapa de nomes normalizados para IDs dos times
    const timeMap = {};
    for (const time of times) {
      const nomeNormalizado = await normalizarNomeTime(time.nome);
      timeMap[nomeNormalizado] = time.id;
    }

    // Lê o arquivo CSV
    const conteudo = fs.readFileSync('jogadores_importacao.csv', 'utf-8');
    const linhas = conteudo.split('\n');
    const cabecalho = linhas[0].split(',');

    // Índices das colunas
    const indices = {
      time: cabecalho.indexOf('Time'),
      nome: cabecalho.indexOf('nome'),
      numero: cabecalho.indexOf('numero'),
      posicao: cabecalho.indexOf('posicao'),
      nacionalidade: cabecalho.indexOf('nacionalidade'),
      foto: cabecalho.indexOf('foto'),
      apiId: cabecalho.indexOf('apiId')
    };

    // Processa cada linha do CSV
    const jogadores = [];
    for (let i = 1; i < linhas.length; i++) {
      if (!linhas[i].trim()) continue;
      
      const valores = linhas[i].split(',');
      const nomeTime = valores[indices.time].trim();
      const nomeTimeNormalizado = await normalizarNomeTime(nomeTime);
      const timeId = timeMap[nomeTimeNormalizado];

      if (!timeId) {
        console.log(`Time não encontrado após normalização: ${nomeTime} (normalizado: ${nomeTimeNormalizado})`);
        console.log('Times disponíveis:', Object.keys(timeMap).join(', '));
        continue;
      }

      const jogador = {
        nome: valores[indices.nome].trim(),
        numero: parseInt(valores[indices.numero]),
        posicao: valores[indices.posicao].trim(),
        nacionalidade: valores[indices.nacionalidade].trim(),
        foto: valores[indices.foto].trim(),
        apiId: valores[indices.apiId].trim() || null,
        time: {
          connect: {
            id: timeId
          }
        }
      };

      try {
        const jogadorCriado = await prisma.jogador.create({
          data: jogador
        });
        console.log(`Jogador ${jogador.nome} criado com sucesso para o time ID ${timeId}`);
      } catch (error) {
        console.error(`Erro ao criar jogador ${jogador.nome}:`, error);
      }
    }

    console.log('Processamento do CSV concluído.');
  } catch (error) {
    console.error('Erro ao processar o CSV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

processarCSV(); 