const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function updateTeamShields() {
  try {
    const times = await prisma.time.findMany();
    
    for (const time of times) {
      try {
        const response = await axios.get(`https://api.api-futebol.com.br/v1/times/${time.apiId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.API_FUTEBOL_KEY}`
          }
        });
        
        const escudo = response.data.escudo;
        
        await prisma.time.update({
          where: { id: time.id },
          data: { escudo }
        });
        
        console.log(`Escudo atualizado para o time ${time.nome}`);
      } catch (error) {
        console.error(`Erro ao atualizar escudo do time ${time.nome}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Erro ao buscar times:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateTeamShields(); 