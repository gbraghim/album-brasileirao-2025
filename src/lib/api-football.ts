import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = 'v3.football.api-sports.io';

interface Time {
  team: {
    id: number;
    name: string;
    logo: string;
  };
}

interface Jogador {
  player: {
    id: number;
    name: string;
    age: number;
    nationality: string;
    photo: string;
  };
  statistics: {
    games: {
      position: string;
    };
  }[];
}

export async function buscarTimes(): Promise<Time[]> {
  try {
    const response = await fetch(`${API_URL}/teams?league=71&season=2024`, {
      headers: {
        'x-rapidapi-key': API_KEY!,
        'x-rapidapi-host': API_HOST,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar times');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Erro ao buscar times:', error);
    return [];
  }
}

export async function buscarJogadoresPorTime(timeId: number): Promise<Jogador[]> {
  try {
    const response = await fetch(
      `${API_URL}/players?team=${timeId}&season=2024`,
      {
        headers: {
          'x-rapidapi-key': API_KEY!,
          'x-rapidapi-host': API_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar jogadores');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return [];
  }
}

export async function sincronizarDados() {
  try {
    const times = await buscarTimes();

    for (const time of times) {
      const timeExistente = await prisma.time.findUnique({
        where: { apiId: time.team.id },
      });

      let timeId;
      if (!timeExistente) {
        const novoTime = await prisma.time.create({
          data: {
            nome: time.team.name,
            escudo: time.team.logo,
            apiId: time.team.id,
          },
        });
        timeId = novoTime.id;
      } else {
        timeId = timeExistente.id;
      }

      const jogadores = await buscarJogadoresPorTime(time.team.id);

      for (const jogador of jogadores) {
        const jogadorExistente = await prisma.jogador.findUnique({
          where: { apiId: jogador.player.id },
        });

        if (!jogadorExistente) {
          await prisma.jogador.create({
            data: {
              nome: jogador.player.name,
              idade: jogador.player.age,
              nacionalidade: jogador.player.nationality,
              foto: jogador.player.photo,
              posicao: jogador.statistics[0]?.games.position || 'N/A',
              apiId: jogador.player.id,
              timeId: timeId,
            },
          });
        }

        // Aguarda 1 segundo para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log('Sincronização concluída com sucesso');
  } catch (error) {
    console.error('Erro ao sincronizar dados:', error);
    throw error;
  }
} 