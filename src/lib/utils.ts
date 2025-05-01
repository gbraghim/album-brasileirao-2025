export function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function formatarNomeArquivo(nome: string): string[] {
  // Remove espaços extras e normaliza espaços
  const nomeNormalizado = nome.trim().replace(/\s+/g, '');
  const variantes = new Set<string>();

  // Adiciona o nome original sem espaços
  variantes.add(nomeNormalizado);

  // Adiciona versão sem acentos
  const nomeSemAcentos = removerAcentos(nomeNormalizado);
  variantes.add(nomeSemAcentos);

  // Adiciona versões em minúsculas
  variantes.add(nomeNormalizado.toLowerCase());
  variantes.add(nomeSemAcentos.toLowerCase());

  // Adiciona versões com primeira letra maiúscula
  variantes.add(nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1).toLowerCase());
  variantes.add(nomeSemAcentos.charAt(0).toUpperCase() + nomeSemAcentos.slice(1).toLowerCase());

  // Remove duplicatas e converte para array
  return Array.from(variantes);
}

export function formatarCaminhoImagem(time: string, nome: string): string[] {
  // Remove espaços extras e normaliza espaços
  const nomeNormalizado = nome.trim().replace(/\s+/g, ' ');
  // Separa em palavras, coloca a primeira letra de cada palavra em maiúsculo e o resto em minúsculo, depois junta tudo
  const nomeFormatado = nomeNormalizado
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join('');

  // Trata nomes especiais dos times
  let pastaTime = time;
  if (time === 'São Paulo') {
    pastaTime = 'SãoPaulo';
  } else if (time === 'Atlético Mineiro') {
    pastaTime = 'AtléticoMineiro';
  }

  // Gera apenas o caminho correto
  const caminho = `/players/${pastaTime}/${nomeFormatado}.jpg`;

  return [caminho];
} 