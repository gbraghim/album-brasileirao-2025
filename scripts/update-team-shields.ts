import { PrismaClient } from '@prisma/client';
import axios from 'axios';

interface TimeAPI {
  escudo: string;
}

const prisma = new PrismaClient();

async function updateTeamShields() {
  try {
    // Obter todos os times do banco de dados
    const times = await prisma.time.findMany();

    // Atualizar cada time
    for (const time of times) {
      try {
        // Fazer requisição para a API
        const response = await axios.get<TimeAPI>(`https://api.api-futebol.com.br/v1/times/${time.apiId}`, {
          headers: {
            'Authorization': 'Bearer test_1234567890'
          }
        });

        const escudo = response.data.escudo;

        // Atualizar o time no banco de dados
        await prisma.time.update({
          where: { id: time.id },
          data: { escudo }
        });

        console.log(`Escudo atualizado para o time ${time.nome}`);
      } catch (error) {
        console.error(`Erro ao atualizar escudo do time ${time.nome}:`, error);
      }
    }

    console.log('Atualização de escudos concluída');
  } catch (error) {
    console.error('Erro ao atualizar escudos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTeamShields(); 