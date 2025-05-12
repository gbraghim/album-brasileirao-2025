import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedProdutosFigurinha() {
  await prisma.produto_figurinha.upsert({
    where: { stripe_product_id: 'prod_SIIAtzOUFmdOgR' },
    update: {},
    create: {
      nome: 'Figurinha Lendária',
      raridade: 'Lendário',
      stripe_product_id: 'prod_SIIAtzOUFmdOgR',
      stripe_price_id: 'price_1RNhaFGSr3jmLzJW33snKIFt',
      valor_centavos: 2000,
      ativo: true
    }
  });
  await prisma.produto_figurinha.upsert({
    where: { stripe_product_id: 'prod_SIICfIeDFsA1VZ' },
    update: {},
    create: {
      nome: 'Figurinha Ouro',
      raridade: 'Ouro',
      stripe_product_id: 'prod_SIICfIeDFsA1VZ',
      stripe_price_id: 'price_1RNhbdGSr3jmLzJWiYhnBbjD',
      valor_centavos: 1000,
      ativo: true
    }
  });
  await prisma.produto_figurinha.upsert({
    where: { stripe_product_id: 'prod_SIICfIeDFsA1VZ' },
    update: {},
    create: {
      nome: 'Figurinha Prata',
      raridade: 'Prata',
      stripe_product_id: 'prod_SIICfIeDFsA1VZ',
      stripe_price_id: 'price_1RNhbdGSr3jmLzJWiYhnBbjD',
      valor_centavos: 500,
      ativo: true
    }
  });
}

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
  await seedProdutosFigurinha();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 