import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed seguro: apenas upsert dos pacotes premium
  await prisma.pacotePreco.upsert({
    where: { stripeProductId: 'prod_SEWdEkXR93B0iM' },
    update: {},
    create: {
      nome: 'Pacote Individual',
      descricao: '1 pacote de figurinhas',
      stripeProductId: 'prod_SEWdEkXR93B0iM',
      stripePriceId: 'price_1RK3afGSr3jmLzJWygL6lfxI',
      quantidade: 1,
      valorCentavos: 990,
    },
  });
  await prisma.pacotePreco.upsert({
    where: { stripeProductId: 'prod_SEWeKjqgTWtBzM' },
    update: {},
    create: {
      nome: 'Pacote Duplo',
      descricao: '2 pacotes de figurinhas',
      stripeProductId: 'prod_SEWeKjqgTWtBzM',
      stripePriceId: 'price_1RK3bfGSr3jmLzJWYeeT4hzA',
      quantidade: 2,
      valorCentavos: 1790,
    },
  });
  await prisma.pacotePreco.upsert({
    where: { stripeProductId: 'prod_SEWfvKHgpkW2u9' },
    update: {},
    create: {
      nome: 'Pacote Triplo',
      descricao: '3 pacotes de figurinhas',
      stripeProductId: 'prod_SEWfvKHgpkW2u9',
      stripePriceId: 'price_1RK3cGGSr3jmLzJWYDVOc1Ha',
      quantidade: 3,
      valorCentavos: 2490,
    },
  });
}

main().finally(() => prisma.$disconnect()); 