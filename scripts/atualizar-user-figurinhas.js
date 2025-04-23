import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function atualizarUserFigurinhas() {
  try {
    console.log('Iniciando atualização das figurinhas...');

    // Buscar todas as figurinhas do usuário com seus relacionamentos
    const userFigurinhas = await prisma.userFigurinha.findMany({
      include: {
        figurinha: {
          include: {
            jogador: {
              include: {
                time: true
              }
            }
          }
        }
      }
    });

    console.log(`Total de figurinhas encontradas: ${userFigurinhas.length}`);

    // Atualizar cada registro
    for (const userFigurinha of userFigurinhas) {
      try {
        const jogador = userFigurinha.figurinha?.jogador;
        const time = jogador?.time;

        if (!jogador || !time) {
          console.log(`Figurinha ${userFigurinha.id} não tem jogador ou time completo`);
          continue;
        }

        // Atualizar a UserFigurinha
        await prisma.userFigurinha.update({
          where: { id: userFigurinha.id },
          data: {
            nomeJogador: jogador.nome || '',
            nomeTime: time.nome || ''
          }
        });

        console.log(`Atualizado: ${jogador.nome} - ${time.nome}`);
      } catch (erro) {
        console.error(`Erro ao processar figurinha ${userFigurinha.id}:`, erro);
      }
    }

    console.log('Atualização concluída com sucesso!');
  } catch (erro) {
    console.error('Erro ao atualizar registros:', erro);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarUserFigurinhas(); 