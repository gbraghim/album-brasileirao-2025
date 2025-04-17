import { prisma } from '../src/lib/prisma';
import { criarPacotesParaUsuario } from '../src/lib/pacotes';

async function main() {
  const email = 'gustavoteste1@gmail.com';
  const quantidade = 10;

  console.log(`Criando ${quantidade} pacotes para o usuário ${email}...`);

  try {
    const quantidadeCriada = await criarPacotesParaUsuario(email, quantidade);
    console.log(`✅ ${quantidadeCriada} pacotes criados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao criar pacotes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 