const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function atualizarEscudos() {
  try {
    // Mapa de apiIds para caminhos dos escudos
    const escudosMap = {
      1: '/escudos/atletico_mg.png',
      2: '/escudos/bahia.png',
      3: '/escudos/botafogo.png',
      4: '/escudos/bragantino.png',
      5: '/escudos/ceara.png',
      6: '/escudos/corinthians.png',
      7: '/escudos/cruzeiro.png',
      8: '/escudos/flamengo.png',
      9: '/escudos/fluminense.png',
      10: '/escudos/fortaleza.png',
      11: '/escudos/gremio.png',
      12: '/escudos/internacional.png',
      13: '/escudos/juventude.png',
      14: '/escudos/mirassol.png',
      15: '/escudos/palmeiras.png',
      16: '/escudos/santos.png',
      17: '/escudos/sao_paulo.png',
      18: '/escudos/sport.png',
      19: '/escudos/vasco.png',
      20: '/escudos/vitoria.png'
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