import { PrismaClient, TipoPacote } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando script para adicionar 2 pacotes DIARIO para todos os usuários...');

  const usuarios = await prisma.user.findMany({ select: { id: true, email: true } });
  console.log(`Total de usuários encontrados: ${usuarios.length}`);

  for (const usuario of usuarios) {
    console.log(`Adicionando pacotes para usuário: ${usuario.email} (ID: ${usuario.id})`);
    for (let i = 1; i <= 2; i++) {
      const pacote = await prisma.pacote.create({
        data: {
          userId: usuario.id,
          tipo: TipoPacote.DIARIO,
          aberto: false
        }
      });
      console.log(`  Pacote DIARIO ${i} criado com ID: ${pacote.id}`);
    }
  }

  console.log('Listando todos os emails de usuários:');
  const emails = usuarios.map(u => u.email);
  emails.forEach(email => console.log(`- ${email}`));

  console.log('Script finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 