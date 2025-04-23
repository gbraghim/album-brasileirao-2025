const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarDados() {
  try {
    // 1. Verificar um jogador
    console.log('Verificando jogador...');
    const jogador = await prisma.jogador.findFirst({
      include: {
        time: true
      }
    });
    console.log('Dados do jogador:', jogador);

    // 2. Criar uma figurinha de teste
    console.log('\nCriando figurinha de teste...');
    const figurinha = await prisma.figurinha.create({
      data: {
        nome: jogador.nome,
        numero: jogador.numero,
        posicao: jogador.posicao,
        nacionalidade: jogador.nacionalidade,
        foto: jogador.foto,
        timeId: jogador.timeId,
        jogadorId: jogador.id
      }
    });
    console.log('Figurinha criada:', figurinha);

    // 3. Verificar a figurinha criada
    console.log('\nVerificando figurinha criada...');
    const figurinhaVerificada = await prisma.figurinha.findUnique({
      where: { id: figurinha.id },
      include: {
        jogador: true,
        time: true
      }
    });
    console.log('Figurinha verificada:', figurinhaVerificada);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarDados(); 