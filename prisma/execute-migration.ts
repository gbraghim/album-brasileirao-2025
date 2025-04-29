import { PrismaClient } from '@prisma/client';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
    // Aqui você pode adicionar suas migrações
    // Por exemplo:
    // await prisma.user.create({...})
    
    console.log('Migrações executadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 