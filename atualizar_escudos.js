const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function atualizarEscudos() {
  try {
    // Mapa de nomes de times para nomes de arquivos de escudo
    const escudosMap = {
      'Palmeiras': 'palmeiras.png',
      'Corinthians': 'corinthians.png',
      'Grêmio': 'gremio.png',
      'Internacional': 'internacional.png',
      'Bahia': 'bahia.png',
      'Ceará': 'ceara.png',
      'Cruzeiro': 'cruzeiro.png',
      'Vasco': 'vasco.png',
      'Vitória': 'vitoria.png'
    };

    // Atualiza cada time com seu escudo
    for (const [nomeTime, nomeArquivo] of Object.entries(escudosMap)) {
      try {
        await prisma.time.update({
          where: {
            nome: nomeTime
          },
          data: {
            escudo: `/escudos/${nomeArquivo}`
          }
        });
        console.log(`Escudo atualizado para o time ${nomeTime}`);
      } catch (error) {
        console.error(`Erro ao atualizar escudo do time ${nomeTime}:`, error);
      }
    }

    console.log('Processamento concluído!');
  } catch (error) {
    console.error('Erro ao processar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarEscudos(); 