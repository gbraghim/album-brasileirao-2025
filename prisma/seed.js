require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('--- INICIANDO SEED ---');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function main() {
  console.log('Inserindo Pacote Individual...');
  await prisma.pacotePreco.upsert({
    where: { stripeProductId: 'prod_SGHwgvUyWMRd4s' },
    update: {},
    create: {
      nome: 'Pacote Individual',
      descricao: '1 pacote de figurinhas',
      stripeProductId: 'prod_SGHwgvUyWMRd4s',
      stripePriceId: 'price_1RLlMQGSr3jmLzJWWc68axF5',
      quantidade: 1,
      valorCentavos: 500,
      ativo: true,
    },
  });
  console.log('Pacote Individual inserido!');

  console.log('Inserindo Pacote Duplo...');
  await prisma.pacotePreco.upsert({
    where: { stripeProductId: 'prod_SGHxgduSmW30TW' },
    update: {},
    create: {
      nome: 'Pacote Duplo',
      descricao: '2 pacotes de figurinhas',
      stripeProductId: 'prod_SGHxgduSmW30TW',
      stripePriceId: 'price_1RLlN6GSr3jmLzJWrgEGLvGn',
      quantidade: 2,
      valorCentavos: 950,
      ativo: true,
    },
  });
  console.log('Pacote Duplo inserido!');

  console.log('Inserindo Pacote Triplo...');
  await prisma.pacotePreco.upsert({
    where: { stripeProductId: 'prod_SGHxb9LnnKA6JL' },
    update: {},
    create: {
      nome: 'Pacote Triplo',
      descricao: '3 pacotes de figurinhas',
      stripeProductId: 'prod_SGHxb9LnnKA6JL',
      stripePriceId: 'price_1RLlNmGSr3jmLzJWOk3wdMzy',
      quantidade: 3,
      valorCentavos: 1400,
      ativo: true,
    },
  });
  console.log('Pacote Triplo inserido!');
}

main()
  .then(() => {
    console.log('--- SEED FINALIZADO COM SUCESSO ---');
  })
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma desconectado.');
  }); 