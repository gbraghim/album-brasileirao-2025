import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'full@full.full'.toLowerCase();
  const idManual = 'cman2jcc00000vimkoqatan1x'; // ID do usuário informado

  // Listar todos os usuários encontrados
  const todos = await prisma.user.findMany();
  console.log('Usuários encontrados no banco:');
  todos.forEach(u => console.log(`- id: ${u.id}, email: ${u.email}`));

  console.log(`Buscando usuário de desenvolvimento com email: ${email}`);
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.warn('Usuário não encontrado por email. Tentando buscar por ID manualmente...');
    user = await prisma.user.findUnique({ where: { id: idManual } });
    if (user) {
      console.log(`Usuário encontrado por ID: ${user.id} (${user.email})`);
    }
  }

  if (!user) {
    console.error('Usuário não encontrado!');
    process.exit(1);
  }

  console.log(`Usuário encontrado: ${user.id} (${user.email})`);

  const jogadores = await prisma.jogador.findMany();
  console.log(`Total de jogadores encontrados: ${jogadores.length}`);

  let criadas = 0;
  for (const jogador of jogadores) {
    // Verifica se já existe uma figurinha desse jogador para o usuário
    const existente = await prisma.userFigurinha.findFirst({
      where: {
        userId: user.id,
        figurinha: { jogadorId: jogador.id }
      }
    });
    if (existente) {
      console.log(`Usuário já possui figurinha do jogador ${jogador.nome} (${jogador.id})`);
      continue;
    }
    // Cria a figurinha e a relação com o usuário
    const figurinha = await prisma.figurinha.create({
      data: {
        nome: jogador.nome,
        numero: jogador.numero,
        posicao: jogador.posicao,
        nacionalidade: jogador.nacionalidade,
        foto: jogador.foto,
        timeId: jogador.timeId,
        jogadorId: jogador.id,
        raridade: jogador.raridade
      }
    });
    await prisma.userFigurinha.create({
      data: {
        userId: user.id,
        figurinhaId: figurinha.id,
        quantidade: 1,
        nomeJogador: jogador.nome || '',
        nomeTime: '',
      }
    });
    criadas++;
    console.log(`Figurinha criada para jogador ${jogador.nome} (${jogador.id})`);
  }

  console.log(`Processo finalizado. Total de figurinhas criadas para o usuário: ${criadas}`);
}

main()
  .catch((e) => {
    console.error('Erro no script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 