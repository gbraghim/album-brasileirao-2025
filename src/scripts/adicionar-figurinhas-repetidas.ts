import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

async function adicionarFigurinhasRepetidas() {
  try {
    console.log('Iniciando processo de adição de figurinhas repetidas...');

    // Buscar todos os usuários
    const usuarios = await prisma.user.findMany();
    console.log(`Encontrados ${usuarios.length} usuários`);

    // Buscar figurinhas de ouro e prata
    const figurinhasOuroPrata = await prisma.figurinha.findMany({
      where: {
        raridade: {
          in: ['OURO', 'PRATA']
        }
      }
    });
    console.log(`Encontradas ${figurinhasOuroPrata.length} figurinhas de ouro e prata`);

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

      // Filtrar apenas figurinhas de ouro e prata que o usuário já possui
      const figurinhasOuroPrataUsuario = figurinhasUsuario.filter(
        f => f.figurinha.raridade === 'OURO' || f.figurinha.raridade === 'PRATA'
      );

      if (figurinhasOuroPrataUsuario.length === 0) {
        console.log(`Usuário ${usuario.name} não possui figurinhas de ouro ou prata. Pulando...`);
        continue;
      }

      // Selecionar 10 figurinhas aleatórias das que o usuário já possui
      const figurinhasParaAdicionar = figurinhasOuroPrataUsuario
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      console.log(`Adicionando 10 figurinhas repetidas para ${usuario.name}`);

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