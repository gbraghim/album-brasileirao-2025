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
  { nome: 'Cruzeiro', arquivo: 'cruzeiro.png', slug: 'cruzeiro' },
  { nome: 'Cuiabá', arquivo: 'cuiaba.jpg', slug: 'cuiaba' }
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