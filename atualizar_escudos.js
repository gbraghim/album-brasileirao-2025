const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function atualizarEscudos() {
  try {
    // Mapa de apiIds para caminhos locais dos escudos
    const escudosMap = {
      1: '/escudos/america-mineiro.png',
      2: '/escudos/atletico-paranaense.png',
      3: '/escudos/atletico-mineiro.png',
      4: '/escudos/bahia.png',
      5: '/escudos/botafogo.png',
      6: '/escudos/corinthians.png',
      7: '/escudos/coritiba.png',
      8: '/escudos/cruzeiro.png',
      9: '/escudos/cuiaba.png',
      10: '/escudos/flamengo.png',
      11: '/escudos/fluminense.png',
      12: '/escudos/fortaleza.png',
      13: '/escudos/goias.png',
      14: '/escudos/gremio.png',
      15: '/escudos/internacional.png',
      16: '/escudos/palmeiras.png',
      17: '/escudos/bragantino.png',
      18: '/escudos/santos.png',
      19: '/escudos/sao-paulo.png',
      20: '/escudos/vasco.png'
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