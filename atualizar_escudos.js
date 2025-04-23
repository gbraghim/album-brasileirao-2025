const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function atualizarEscudos() {
  try {
    // Mapa de apiIds para caminhos locais dos escudos
    const escudosMap = {
      1: '/escudos/america-mineiro.png',
      2: '/escudos/atletico-paranaense.png',
      3: '/escudos/atletico_mg.png',
      4: '/escudos/Bragantino.jpg',
      5: '/escudos/bahia.png',
      6: '/escudos/botafogo.png',
      7: '/escudos/corinthians.png',
      8: '/escudos/coritiba.png',
      9: '/escudos/cruzeiro.png',
      10: '/escudos/cuiaba.png',
      11: '/escudos/flamengo.png',
      12: '/escudos/fluminense.png',
      13: '/escudos/fortaleza.png',
      14: '/escudos/goias.png',
      15: '/escudos/gremio.png',
      16: '/escudos/internacional.png',
      17: '/escudos/palmeiras.png',
      18: '/escudos/bragantino.png',
      19: '/escudos/santos.png',
      20: '/escudos/sao_paulo.png',
      21: '/escudos/vasco.png'
    };

    // Atualiza cada time com seu escudo
    for (const [apiId, urlEscudo] of Object.entries(escudosMap)) {
      try {
        await prisma.time.update({
          where: {
            apiId: parseInt(apiId)
          },
          data: {
            escudo: urlEscudo
          }
        });
        console.log(`Escudo atualizado para o time com apiId ${apiId}`);
      } catch (error) {
        console.error(`Erro ao atualizar escudo do time com apiId ${apiId}:`, error);
      }
    }

    console.log('Processamento concluído!');
  } catch (error) {
    console.error('Erro ao atualizar escudos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarEscudos(); 