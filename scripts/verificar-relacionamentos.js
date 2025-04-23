import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarRelacionamentos() {
  try {
    console.log('Verificando figurinhas...');
    
    // Buscar todas as figurinhas
    const figurinhas = await prisma.figurinha.findMany({
      include: {
        jogador: {
          include: {
            time: true
          }
        }
      }
    });

    console.log(`Total de figurinhas: ${figurinhas.length}`);

    let figurinhasSemJogador = 0;
    let jogadoresSemTime = 0;

    for (const figurinha of figurinhas) {
      if (!figurinha.jogador) {
        console.log(`Figurinha ${figurinha.id} não tem jogador associado`);
        figurinhasSemJogador++;
        continue;
      }

      if (!figurinha.jogador.time) {
        console.log(`Jogador ${figurinha.jogador.nome} (ID: ${figurinha.jogador.id}) não tem time associado`);
        jogadoresSemTime++;
      }
    }

    console.log('\nResumo:');
    console.log(`Total de figurinhas: ${figurinhas.length}`);
    console.log(`Figurinhas sem jogador: ${figurinhasSemJogador}`);
    console.log(`Jogadores sem time: ${jogadoresSemTime}`);

    // Verificar UserFigurinhas
    console.log('\nVerificando UserFigurinhas...');
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

    console.log(`Total de UserFigurinhas: ${userFigurinhas.length}`);
    
    for (const uf of userFigurinhas) {
      console.log(`\nUserFigurinha ID: ${uf.id}`);
      console.log(`Nome Jogador atual: ${uf.nomeJogador}`);
      console.log(`Nome Time atual: ${uf.nomeTime}`);
      console.log(`Jogador vinculado: ${uf.figurinha?.jogador?.nome || 'Não encontrado'}`);
      console.log(`Time vinculado: ${uf.figurinha?.jogador?.time?.nome || 'Não encontrado'}`);
    }

  } catch (erro) {
    console.error('Erro ao verificar relacionamentos:', erro);
  } finally {
    await prisma.$disconnect();
  }
}

verificarRelacionamentos(); 