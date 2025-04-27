import { PrismaClient, TipoNotificacao } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando migração de tipos de notificação...');

  // Atualizar notificações de troca aceita
  await prisma.notificacao.updateMany({
    where: {
      tipo: 'TROCA_ACEITA'
    },
    data: {
      tipoNovo: TipoNotificacao.TROCA_ACEITA
    }
  });

  // Atualizar notificações de troca recusada
  await prisma.notificacao.updateMany({
    where: {
      tipo: 'TROCA_RECUSADA'
    },
    data: {
      tipoNovo: TipoNotificacao.TROCA_RECUSADA
    }
  });

  // Atualizar notificações de troca finalizada
  await prisma.notificacao.updateMany({
    where: {
      tipo: 'TROCA_FINALIZADA'
    },
    data: {
      tipoNovo: TipoNotificacao.TROCA_FINALIZADA
    }
  });

  // Atualizar notificações de troca cancelada
  await prisma.notificacao.updateMany({
    where: {
      tipo: 'TROCA_CANCELADA'
    },
    data: {
      tipoNovo: TipoNotificacao.TROCA_CANCELADA
    }
  });

  // Atualizar notificações de pacote aberto
  await prisma.notificacao.updateMany({
    where: {
      tipo: 'PACOTE_ABERTO'
    },
    data: {
      tipoNovo: TipoNotificacao.PACOTE_ABERTO
    }
  });

  // Atualizar notificações de figurinha nova
  await prisma.notificacao.updateMany({
    where: {
      tipo: 'FIGURINHA_NOVA'
    },
    data: {
      tipoNovo: TipoNotificacao.FIGURINHA_NOVA
    }
  });

  console.log('Migração concluída!');
}

main()
  .catch((e) => {
    console.error('Erro durante a migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 