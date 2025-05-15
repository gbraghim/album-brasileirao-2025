const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function adicionarFigurinhasRepetidas() {
  try {
    console.log('Iniciando processo de adição de figurinhas repetidas...');

    // Buscar todos os usuários
    const usuarios = await prisma.user.findMany();
    console.log(`Encontrados ${usuarios.length} usuários`);

    // Para cada usuário
    for (const usuario of usuarios) {
      console.log(`\nProcessando usuário: ${usuario.name}`);

      // Buscar figurinhas que o usuário já possui
      const figurinhasUsuario = await prisma.userFigurinha.findMany({
        where: {
          userId: usuario.id
        },
        include: {
          figurinha: true
        }
      });

      console.log(`Total de figurinhas do usuário: ${figurinhasUsuario.length}`);

      // Filtrar apenas figurinhas de ouro e prata que o usuário já possui
      const figurinhasOuroPrataUsuario = figurinhasUsuario.filter(f => {
        const raridade = f.figurinha.raridade?.toUpperCase();
        console.log(`Verificando figurinha ${f.figurinha.nome} - Raridade: ${raridade}`);
        return raridade === 'OURO' || raridade === 'PRATA';
      });

      console.log(`Figurinhas de ouro/prata encontradas: ${figurinhasOuroPrataUsuario.length}`);

      if (figurinhasOuroPrataUsuario.length === 0) {
        console.log(`Usuário ${usuario.name} não possui figurinhas de ouro ou prata. Pulando...`);
        continue;
      }

      // Selecionar 10 figurinhas aleatórias das que o usuário já possui
      const figurinhasParaAdicionar = figurinhasOuroPrataUsuario
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      console.log(`Adicionando ${figurinhasParaAdicionar.length} figurinhas repetidas para ${usuario.name}`);

      // Adicionar as figurinhas repetidas
      for (const figurinha of figurinhasParaAdicionar) {
        await prisma.userFigurinha.update({
          where: {
            id: figurinha.id
          },
          data: {
            quantidade: {
              increment: 1
            }
          }
        });
        console.log(`Adicionada 1 unidade da figurinha ${figurinha.figurinha.nome} (${figurinha.figurinha.raridade})`);
      }
    }

    console.log('\nProcesso concluído com sucesso!');

    // Listar emails dos usuários
    console.log('\nLista de emails dos usuários:');
    const emails = usuarios.map(u => u.email);
    const emailsPorLinha = 50;
    
    for (let i = 0; i < emails.length; i += emailsPorLinha) {
      const linhaEmails = emails.slice(i, i + emailsPorLinha);
      console.log(linhaEmails.join(' '));
    }

  } catch (error) {
    console.error('Erro ao adicionar figurinhas repetidas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
adicionarFigurinhasRepetidas(); 