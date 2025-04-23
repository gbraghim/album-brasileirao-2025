const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function atualizarEscudos() {
  try {
    // Mapa de apiIds para URLs dos escudos no Cloudinary
    const escudosMap = {
      1: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/america-mineiro',
      2: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/atletico-paranaense',
      3: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/atletico-mineiro',
      4: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/bahia',
      5: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/botafogo',
      6: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/corinthians',
      7: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/coritiba',
      8: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/cruzeiro',
      9: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/cuiaba',
      10: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/flamengo',
      11: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/fluminense',
      12: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/fortaleza',
      13: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/goias',
      14: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/gremio',
      15: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/internacional',
      16: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/palmeiras',
      17: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/bragantino',
      18: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/santos',
      19: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/sao-paulo',
      20: 'https://res.cloudinary.com/drncqru7f/image/upload/v1/album-brasileirao/escudos/vasco'
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