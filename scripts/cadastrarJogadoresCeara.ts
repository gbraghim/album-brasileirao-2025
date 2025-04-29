import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function cadastrarJogadoresCeara() {
  try {
    // Diretório onde estão as imagens dos jogadores
    const diretorioJogadores = path.join(process.cwd(), 'public', 'players', 'Ceará');
    
    // Ler todos os arquivos do diretório
    const arquivos = fs.readdirSync(diretorioJogadores);
    
    // Filtrar apenas arquivos de imagem
    const imagens = arquivos.filter(arquivo => 
      arquivo.endsWith('.jpg') || 
      arquivo.endsWith('.jpeg') || 
      arquivo.endsWith('.png')
    );

    console.log(`Encontrados ${imagens.length} jogadores para cadastrar`);

    for (const imagem of imagens) {
      try {
        // Extrair o nome do jogador do nome do arquivo (remover extensão)
        const nomeJogador = path.parse(imagem).name;
        
        // Verificar se o jogador já existe
        const jogadorExistente = await prisma.jogador.findFirst({
          where: {
            nome: nomeJogador,
            timeId: '5' // ID do Ceará como string
          }
        });

        if (jogadorExistente) {
          console.log(`Jogador ${nomeJogador} já existe, pulando...`);
          continue;
        }

        // Gerar ID único
        const id = uuidv4().replace(/-/g, '').substring(0, 25);
        
        // Gerar número aleatório entre 1 e 100
        const numero = Math.floor(Math.random() * 100) + 1;
        
        // Gerar apiId aleatório
        const apiId = Math.floor(Math.random() * 9000000) + 1000000;

        // Cadastrar jogador
        await prisma.jogador.create({
          data: {
            id,
            nome: nomeJogador,
            numero,
            nacionalidade: 'Brasil',
            apiId,
            timeId: '5', // ID do Ceará como string
            raridade: 'Prata'
          }
        });

        console.log(`Jogador ${nomeJogador} cadastrado com sucesso!`);
      } catch (error) {
        console.error(`Erro ao cadastrar jogador ${imagem}:`, error);
      }
    }

    console.log('Processo de cadastro concluído!');
  } catch (error) {
    console.error('Erro ao processar cadastro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
cadastrarJogadoresCeara(); 