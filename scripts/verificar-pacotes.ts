import { prisma } from '../src/lib/prisma';

async function main() {
  const email = 'gustavoteste1@gmail.com';

  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        pacotes: {
          include: {
            figurinhas: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log(`\nUsuário encontrado: ${user.name} (${user.email})`);
    console.log(`\nTotal de pacotes: ${user.pacotes.length}`);
    
    user.pacotes.forEach((pacote, index) => {
      console.log(`\nPacote ${index + 1}:`);
      console.log(`- ID: ${pacote.id}`);
      console.log(`- Tipo: ${pacote.tipo}`);
      console.log(`- Data de criação: ${pacote.createdAt}`);
      console.log(`- Total de figurinhas: ${pacote.figurinhas.length}`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar pacotes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 