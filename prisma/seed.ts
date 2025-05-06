import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed seguro: apenas upsert dos pacotes premium
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
    },
  });
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
    },
  });
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
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 