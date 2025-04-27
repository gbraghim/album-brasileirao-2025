const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const times = [
  { nome: 'Flamengo', escudo: '/escudos/flamengo.png', apiId: 1 },
  { nome: 'Palmeiras', escudo: '/escudos/palmeiras.png', apiId: 2 },
  { nome: 'São Paulo', escudo: '/escudos/sao_paulo.png', apiId: 3 },
  { nome: 'Corinthians', escudo: '/escudos/corinthians.png', apiId: 4 },
  { nome: 'Fluminense', escudo: '/escudos/fluminense.png', apiId: 5 },
  { nome: 'Vasco', escudo: '/escudos/vasco.png', apiId: 6 },
  { nome: 'Grêmio', escudo: '/escudos/gremio.png', apiId: 7 },
  { nome: 'Internacional', escudo: '/escudos/internacional.png', apiId: 8 },
  { nome: 'Atlético Mineiro', escudo: '/escudos/atletico_mg.png', apiId: 9 },
  { nome: 'Cruzeiro', escudo: '/escudos/cruzeiro.png', apiId: 10 }
];

const jogadoresPorTime = {
  'Flamengo': [
    { nome: 'Rossi', numero: 1, posicao: 'Goleiro', idade: 28, nacionalidade: 'Argentino' },
    { nome: 'Varela', numero: 2, posicao: 'Lateral-direito', idade: 30, nacionalidade: 'Uruguaio' },
    { nome: 'Léo Pereira', numero: 4, posicao: 'Zagueiro', idade: 27, nacionalidade: 'Brasileiro' },
    { nome: 'David Luiz', numero: 23, posicao: 'Zagueiro', idade: 36, nacionalidade: 'Brasileiro' },
    { nome: 'Ayrton Lucas', numero: 6, posicao: 'Lateral-esquerdo', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Erick Pulgar', numero: 5, posicao: 'Volante', idade: 30, nacionalidade: 'Chileno' },
    { nome: 'De La Cruz', numero: 18, posicao: 'Meia', idade: 26, nacionalidade: 'Uruguaio' },
    { nome: 'Arrascaeta', numero: 14, posicao: 'Meia', idade: 29, nacionalidade: 'Uruguaio' },
    { nome: 'Everton Cebolinha', numero: 11, posicao: 'Atacante', idade: 27, nacionalidade: 'Brasileiro' },
    { nome: 'Pedro', numero: 9, posicao: 'Atacante', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Bruno Henrique', numero: 27, posicao: 'Atacante', idade: 33, nacionalidade: 'Brasileiro' },
  ],
  'Palmeiras': [
    { nome: 'Weverton', numero: 21, posicao: 'Goleiro', idade: 36, nacionalidade: 'Brasileiro' },
    { nome: 'Marcos Rocha', numero: 2, posicao: 'Lateral-direito', idade: 35, nacionalidade: 'Brasileiro' },
    { nome: 'Gustavo Gómez', numero: 15, posicao: 'Zagueiro', idade: 30, nacionalidade: 'Paraguaio' },
    { nome: 'Murilo', numero: 26, posicao: 'Zagueiro', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Piquerez', numero: 22, posicao: 'Lateral-esquerdo', idade: 25, nacionalidade: 'Uruguaio' },
    { nome: 'Zé Rafael', numero: 8, posicao: 'Volante', idade: 30, nacionalidade: 'Brasileiro' },
    { nome: 'Richard Ríos', numero: 20, posicao: 'Meia', idade: 23, nacionalidade: 'Colombiano' },
    { nome: 'Raphael Veiga', numero: 23, posicao: 'Meia', idade: 28, nacionalidade: 'Brasileiro' },
    { nome: 'Endrick', numero: 9, posicao: 'Atacante', idade: 17, nacionalidade: 'Brasileiro' },
    { nome: 'Rony', numero: 10, posicao: 'Atacante', idade: 28, nacionalidade: 'Brasileiro' },
    { nome: 'Dudu', numero: 7, posicao: 'Atacante', idade: 31, nacionalidade: 'Brasileiro' },
  ],
  'São Paulo': [
    { nome: 'Rafael', numero: 23, posicao: 'Goleiro', idade: 34, nacionalidade: 'Brasileiro' },
    { nome: 'Rafinha', numero: 13, posicao: 'Lateral-direito', idade: 38, nacionalidade: 'Brasileiro' },
    { nome: 'Arboleda', numero: 5, posicao: 'Zagueiro', idade: 32, nacionalidade: 'Equatoriano' },
    { nome: 'Diego Costa', numero: 4, posicao: 'Zagueiro', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Welington', numero: 6, posicao: 'Lateral-esquerdo', idade: 23, nacionalidade: 'Brasileiro' },
    { nome: 'Pablo Maia', numero: 29, posicao: 'Volante', idade: 22, nacionalidade: 'Brasileiro' },
    { nome: 'Alisson', numero: 25, posicao: 'Meia', idade: 30, nacionalidade: 'Brasileiro' },
    { nome: 'Lucas Moura', numero: 7, posicao: 'Meia', idade: 31, nacionalidade: 'Brasileiro' },
    { nome: 'Luciano', numero: 10, posicao: 'Atacante', idade: 30, nacionalidade: 'Brasileiro' },
    { nome: 'Calleri', numero: 9, posicao: 'Atacante', idade: 30, nacionalidade: 'Argentino' },
    { nome: 'André Silva', numero: 11, posicao: 'Atacante', idade: 26, nacionalidade: 'Brasileiro' },
  ],
  'Corinthians': [
    { nome: 'Cássio', numero: 12, posicao: 'Goleiro', idade: 36, nacionalidade: 'Brasileiro' },
    { nome: 'Fagner', numero: 23, posicao: 'Lateral-direito', idade: 34, nacionalidade: 'Brasileiro' },
    { nome: 'Félix Torres', numero: 3, posicao: 'Zagueiro', idade: 27, nacionalidade: 'Equatoriano' },
    { nome: 'Gustavo Henrique', numero: 4, posicao: 'Zagueiro', idade: 30, nacionalidade: 'Brasileiro' },
    { nome: 'Hugo', numero: 6, posicao: 'Lateral-esquerdo', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Raniele', numero: 8, posicao: 'Volante', idade: 27, nacionalidade: 'Brasileiro' },
    { nome: 'Maycon', numero: 7, posicao: 'Meia', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Rodrigo Garro', numero: 10, posicao: 'Meia', idade: 26, nacionalidade: 'Argentino' },
    { nome: 'Romero', numero: 11, posicao: 'Atacante', idade: 31, nacionalidade: 'Paraguaio' },
    { nome: 'Yuri Alberto', numero: 9, posicao: 'Atacante', idade: 23, nacionalidade: 'Brasileiro' },
    { nome: 'Wesley', numero: 36, posicao: 'Atacante', idade: 19, nacionalidade: 'Brasileiro' },
  ],
  'Fluminense': [
    { nome: 'Fábio', numero: 1, posicao: 'Goleiro', idade: 43, nacionalidade: 'Brasileiro' },
    { nome: 'Samuel Xavier', numero: 2, posicao: 'Lateral-direito', idade: 33, nacionalidade: 'Brasileiro' },
    { nome: 'Felipe Melo', numero: 30, posicao: 'Zagueiro', idade: 40, nacionalidade: 'Brasileiro' },
    { nome: 'Nino', numero: 33, posicao: 'Zagueiro', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Marcelo', numero: 12, posicao: 'Lateral-esquerdo', idade: 35, nacionalidade: 'Brasileiro' },
    { nome: 'André', numero: 7, posicao: 'Volante', idade: 22, nacionalidade: 'Brasileiro' },
    { nome: 'Ganso', numero: 10, posicao: 'Meia', idade: 34, nacionalidade: 'Brasileiro' },
    { nome: 'Renato Augusto', numero: 20, posicao: 'Meia', idade: 36, nacionalidade: 'Brasileiro' },
    { nome: 'Jhon Arias', numero: 21, posicao: 'Atacante', idade: 26, nacionalidade: 'Colombiano' },
    { nome: 'Germán Cano', numero: 14, posicao: 'Atacante', idade: 36, nacionalidade: 'Argentino' },
    { nome: 'Keno', numero: 11, posicao: 'Atacante', idade: 34, nacionalidade: 'Brasileiro' },
  ],
  'Vasco': [
    { nome: 'Léo Jardim', numero: 1, posicao: 'Goleiro', idade: 28, nacionalidade: 'Brasileiro' },
    { nome: 'Paulo Henrique', numero: 2, posicao: 'Lateral-direito', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Medel', numero: 17, posicao: 'Zagueiro', idade: 36, nacionalidade: 'Chileno' },
    { nome: 'João Victor', numero: 4, posicao: 'Zagueiro', idade: 25, nacionalidade: 'Brasileiro' },
    { nome: 'Lucas Piton', numero: 6, posicao: 'Lateral-esquerdo', idade: 23, nacionalidade: 'Brasileiro' },
    { nome: 'Zé Gabriel', numero: 5, posicao: 'Volante', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Payet', numero: 10, posicao: 'Meia', idade: 36, nacionalidade: 'Francês' },
    { nome: 'Galdames', numero: 8, posicao: 'Meia', idade: 27, nacionalidade: 'Chileno' },
    { nome: 'Rossi', numero: 7, posicao: 'Atacante', idade: 30, nacionalidade: 'Argentino' },
    { nome: 'Pablo Vegetti', numero: 99, posicao: 'Atacante', idade: 35, nacionalidade: 'Argentino' },
    { nome: 'David', numero: 11, posicao: 'Atacante', idade: 28, nacionalidade: 'Brasileiro' },
  ],
  'Grêmio': [
    { nome: 'Marchesín', numero: 1, posicao: 'Goleiro', idade: 35, nacionalidade: 'Argentino' },
    { nome: 'João Pedro', numero: 2, posicao: 'Lateral-direito', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Geromel', numero: 3, posicao: 'Zagueiro', idade: 38, nacionalidade: 'Brasileiro' },
    { nome: 'Kannemann', numero: 4, posicao: 'Zagueiro', idade: 32, nacionalidade: 'Argentino' },
    { nome: 'Reinaldo', numero: 6, posicao: 'Lateral-esquerdo', idade: 34, nacionalidade: 'Brasileiro' },
    { nome: 'Villasanti', numero: 5, posicao: 'Volante', idade: 25, nacionalidade: 'Paraguaio' },
    { nome: 'Cristaldo', numero: 10, posicao: 'Meia', idade: 27, nacionalidade: 'Argentino' },
    { nome: 'Pepê', numero: 23, posicao: 'Meia', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Everton Galdino', numero: 7, posicao: 'Atacante', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Diego Costa', numero: 19, posicao: 'Atacante', idade: 35, nacionalidade: 'Brasileiro' },
    { nome: 'Soteldo', numero: 11, posicao: 'Atacante', idade: 26, nacionalidade: 'Venezuelano' },
  ],
  'Internacional': [
    { nome: 'Rochet', numero: 1, posicao: 'Goleiro', idade: 30, nacionalidade: 'Uruguaio' },
    { nome: 'Bustos', numero: 2, posicao: 'Lateral-direito', idade: 27, nacionalidade: 'Argentino' },
    { nome: 'Vitão', numero: 4, posicao: 'Zagueiro', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Mercado', numero: 25, posicao: 'Zagueiro', idade: 37, nacionalidade: 'Argentino' },
    { nome: 'Renê', numero: 6, posicao: 'Lateral-esquerdo', idade: 31, nacionalidade: 'Brasileiro' },
    { nome: 'Aránguiz', numero: 20, posicao: 'Volante', idade: 34, nacionalidade: 'Chileno' },
    { nome: 'Mauricio', numero: 27, posicao: 'Meia', idade: 22, nacionalidade: 'Brasileiro' },
    { nome: 'Alan Patrick', numero: 10, posicao: 'Meia', idade: 32, nacionalidade: 'Brasileiro' },
    { nome: 'Wanderson', numero: 11, posicao: 'Atacante', idade: 29, nacionalidade: 'Brasileiro' },
    { nome: 'Enner Valencia', numero: 13, posicao: 'Atacante', idade: 34, nacionalidade: 'Equatoriano' },
    { nome: 'Wesley', numero: 7, posicao: 'Atacante', idade: 24, nacionalidade: 'Brasileiro' },
  ],
  'Atlético Mineiro': [
    { nome: 'Everson', numero: 1, posicao: 'Goleiro', idade: 33, nacionalidade: 'Brasileiro' },
    { nome: 'Saravia', numero: 2, posicao: 'Lateral-direito', idade: 30, nacionalidade: 'Argentino' },
    { nome: 'Jemerson', numero: 4, posicao: 'Zagueiro', idade: 31, nacionalidade: 'Brasileiro' },
    { nome: 'Mauricio Lemos', numero: 3, posicao: 'Zagueiro', idade: 28, nacionalidade: 'Uruguaio' },
    { nome: 'Guilherme Arana', numero: 13, posicao: 'Lateral-esquerdo', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'Otávio', numero: 8, posicao: 'Volante', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Igor Gomes', numero: 15, posicao: 'Meia', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Zaracho', numero: 10, posicao: 'Meia', idade: 25, nacionalidade: 'Argentino' },
    { nome: 'Paulinho', numero: 7, posicao: 'Atacante', idade: 23, nacionalidade: 'Brasileiro' },
    { nome: 'Hulk', numero: 11, posicao: 'Atacante', idade: 37, nacionalidade: 'Brasileiro' },
    { nome: 'Scarpa', numero: 14, posicao: 'Atacante', idade: 29, nacionalidade: 'Brasileiro' },
  ],
  'Cruzeiro': [
    { nome: 'Anderson', numero: 1, posicao: 'Goleiro', idade: 25, nacionalidade: 'Brasileiro' },
    { nome: 'William', numero: 2, posicao: 'Lateral-direito', idade: 28, nacionalidade: 'Brasileiro' },
    { nome: 'Zé Ivaldo', numero: 4, posicao: 'Zagueiro', idade: 26, nacionalidade: 'Brasileiro' },
    { nome: 'João Marcelo', numero: 3, posicao: 'Zagueiro', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Marlon', numero: 6, posicao: 'Lateral-esquerdo', idade: 27, nacionalidade: 'Brasileiro' },
    { nome: 'Lucas Silva', numero: 16, posicao: 'Volante', idade: 30, nacionalidade: 'Brasileiro' },
    { nome: 'Matheus Pereira', numero: 10, posicao: 'Meia', idade: 27, nacionalidade: 'Brasileiro' },
    { nome: 'Nikão', numero: 7, posicao: 'Meia', idade: 31, nacionalidade: 'Brasileiro' },
    { nome: 'Arthur Gomes', numero: 11, posicao: 'Atacante', idade: 24, nacionalidade: 'Brasileiro' },
    { nome: 'Juan Dinenno', numero: 9, posicao: 'Atacante', idade: 29, nacionalidade: 'Argentino' },
    { nome: 'Robert', numero: 77, posicao: 'Atacante', idade: 23, nacionalidade: 'Brasileiro' },
  ],
};

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar o banco de dados na ordem correta
  await prisma.notificacao.deleteMany();
  await prisma.userFigurinha.deleteMany();
  await prisma.figurinha.deleteMany();
  await prisma.pacote.deleteMany();
  await prisma.jogador.deleteMany();
  await prisma.time.deleteMany();
  await prisma.user.deleteMany();

  // Criar um usuário de teste
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.create({
    data: {
      name: 'Usuário Teste',
      email: 'teste@teste.com',
      password: hashedPassword,
      numeroDeLogins: 0,
      primeiroAcesso: true,
      qtdFigurinhasLendarias: 0,
      qtdFigurinhasOuro: 0,
      qtdFigurinhasPrata: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar times
  for (const time of times) {
    const timeDb = await prisma.time.create({
      data: {
        nome: time.nome,
        escudo: time.escudo,
        apiId: time.apiId,
      },
    });

    // Criar jogadores para cada time
    const jogadores = jogadoresPorTime[time.nome];
    for (const [index, jogador] of jogadores.entries()) {
      await prisma.jogador.create({
        data: {
          nome: jogador.nome,
          numero: jogador.numero,
          posicao: jogador.posicao,
          idade: jogador.idade,
          nacionalidade: jogador.nacionalidade,
          apiId: time.apiId * 100 + index + 1,
          timeId: timeDb.id,
        },
      });
    }
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 