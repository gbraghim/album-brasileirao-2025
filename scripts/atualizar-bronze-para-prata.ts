import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function atualizarRaridade() {
  try {
    // Atualizar raridade dos jogadores
    const jogadoresAtualizados = await prisma.jogador.updateMany({
      where: {
        raridade: 'Bronze'
      },
      data: {
        raridade: 'Prata'
      }
    });

    // Atualizar raridade das figurinhas
    const figurinhasAtualizadas = await prisma.figurinha.updateMany({
      where: {
        raridade: 'Bronze'
      },
      data: {
        raridade: 'Prata'
      }
    });

    // Verificar quantidade de registros atualizados
    const totalJogadoresPrata = await prisma.jogador.count({
      where: {
        raridade: 'Prata'
      }
    });

    const totalFigurinhasPrata = await prisma.figurinha.count({
      where: {
        raridade: 'Prata'
      }
    });

    console.log('Atualização concluída com sucesso!');
    console.log('Jogadores atualizados:', jogadoresAtualizados.count);
    console.log('Figurinhas atualizadas:', figurinhasAtualizadas.count);
    console.log('Total de jogadores com raridade Prata:', totalJogadoresPrata);
    console.log('Total de figurinhas com raridade Prata:', totalFigurinhasPrata);

  } catch (error) {
    console.error('Erro ao atualizar raridade:', error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarRaridade(); 