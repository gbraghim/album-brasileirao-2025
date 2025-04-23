const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure o Cloudinary
cloudinary.config({
  cloud_name: 'drncqru7f',
  api_key: '267789528514714',
  api_secret: '842aCgoFTA4gUla6HDIdWwbsIz4'
});

// Lista de times do Brasileirão
const times = [
  { nome: 'Atlético-MG', arquivo: 'atletico_mg.png', slug: 'atletico-mg' },
  { nome: 'Bahia', arquivo: 'bahia.png', slug: 'bahia' },
  { nome: 'Ceará', arquivo: 'ceara.png', slug: 'ceara' },
  { nome: 'Corinthians', arquivo: 'corinthians.png', slug: 'corinthians' },
  { nome: 'Cruzeiro', arquivo: 'cruzeiro.png', slug: 'cruzeiro' },
  { nome: 'Flamengo', arquivo: 'flamengo.png', slug: 'flamengo' },
  { nome: 'Fluminense', arquivo: 'fluminense.png', slug: 'fluminense' },
  { nome: 'Grêmio', arquivo: 'gremio.png', slug: 'gremio' },
  { nome: 'Internacional', arquivo: 'internacional.png', slug: 'internacional' },
  { nome: 'Juventude', arquivo: 'juventude.png', slug: 'juventude' },
  { nome: 'Mirassol', arquivo: 'mirassol.png', slug: 'mirassol' },
  { nome: 'Palmeiras', arquivo: 'palmeiras.png', slug: 'palmeiras' },
  { nome: 'Santos', arquivo: 'santos.png', slug: 'santos' },
  { nome: 'São Paulo', arquivo: 'sao_paulo.png', slug: 'sao-paulo' },
  { nome: 'Sport', arquivo: 'sport.png', slug: 'sport' },
  { nome: 'Vasco', arquivo: 'vasco.png', slug: 'vasco' },
  { nome: 'Vitória', arquivo: 'vitoria.png', slug: 'vitoria' }
];

async function uploadEscudos() {
  for (const time of times) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'escudos', time.arquivo);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        console.log(`Arquivo não encontrado para o ${time.nome}: ${filePath}`);
        continue;
      }

      // Fazer upload da imagem para o Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'album-brasileirao/escudos',
        public_id: time.slug,
        overwrite: true
      });

      console.log(`Escudo do ${time.nome} enviado com sucesso: ${result.secure_url}`);
    } catch (error) {
      console.error(`Erro ao enviar escudo do ${time.nome}:`, error);
    }
  }
}

uploadEscudos(); 