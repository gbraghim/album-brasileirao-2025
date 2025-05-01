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
  // Trata nomes especiais dos times
  let pastaTime = time;
  if (time === 'São Paulo') {
    pastaTime = 'SãoPaulo';
  } else if (time === 'Atlético Mineiro') {
    pastaTime = 'AtléticoMineiro';
  }

  // Gera todas as variantes possíveis do nome
  const variantesNome = formatarNomeArquivo(nome);
  const caminhos = new Set<string>();

  // Para cada variante do nome, gera múltiplos formatos de caminho
  variantesNome.forEach(variante => {
    // Formato com primeira letra maiúscula
    caminhos.add(`/players/${pastaTime}/${variante.charAt(0).toUpperCase() + variante.slice(1)}.jpg`);
    
    // Formato todo em minúsculas
    caminhos.add(`/players/${pastaTime}/${variante.toLowerCase()}.jpg`);
    
    // Formato com underscore
    caminhos.add(`/players/${pastaTime}/${variante.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}.jpg`);
    
    // Formato com hífen
    caminhos.add(`/players/${pastaTime}/${variante.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.jpg`);
  });

  // Adiciona caminho com nome original (com espaços)
  caminhos.add(`/players/${pastaTime}/${nome.trim()}.jpg`);

  // Converte para array e remove duplicatas
  return Array.from(caminhos);
} 