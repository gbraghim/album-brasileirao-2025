# Álbum de Figurinhas do Brasileirão 2025

Um aplicativo web para coleção e troca de figurinhas do Brasileirão 2025, desenvolvido com Next.js, Prisma e TypeScript.

## Funcionalidades

- 🎭 Autenticação de usuários
- 📦 Compra e abertura de pacotes de figurinhas
- 🔄 Sistema de trocas entre usuários
- 📊 Estatísticas do álbum
- 🏆 Ranking de colecionadores
- 📱 Interface responsiva e moderna

## Tecnologias Utilizadas

- Next.js 14 (App Router)
- TypeScript
- Prisma (ORM)
- NextAuth.js
- Tailwind CSS
- SQLite (Banco de dados)

## Como Executar

1. Clone o repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd album
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações

4. Execute as migrações do banco de dados
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## Estrutura do Projeto

- `/src/app` - Rotas e páginas da aplicação
- `/src/components` - Componentes React reutilizáveis
- `/src/lib` - Utilitários e configurações
- `/prisma` - Schema e migrações do banco de dados
- `/public` - Arquivos estáticos

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 