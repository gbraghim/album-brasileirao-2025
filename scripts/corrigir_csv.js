import fs from 'fs';

const conteudo = fs.readFileSync('jogadores_importacao.csv', 'utf-8');
const linhas = conteudo.split('\n');

// Remove a última linha se estiver incompleta
linhas.pop();

// Adiciona a linha corrigida
linhas.push('Juventude,,Gilberto,9,Centroavante,Brasil,https://img.a.transfermarkt.technology/portrait/medium/164013-1464164132.jpg?lm=1,,1');

// Salva o arquivo
fs.writeFileSync('jogadores_importacao.csv', linhas.join('\n')); 