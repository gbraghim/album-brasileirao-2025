# Álbum Brasileirão 2025

Projeto de álbum de figurinhas digital do Campeonato Brasileiro 2025.

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL (Neon)
- NextAuth.js
- Tailwind CSS
- API-Football

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env` e preencha as variáveis de ambiente
4. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Funcionalidades

- Autenticação de usuários
- Geração de pacotes de figurinhas
- Sistema de trocas
- Visualização de times e jogadores
- Sincronização com API-Football

## Deploy

O projeto está configurado para deploy na Vercel. Para fazer o deploy:

1. Conecte seu repositório GitHub com a Vercel
2. Configure as variáveis de ambiente na Vercel
3. Deploy automático será realizado após cada push na branch main 