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
  const caminhos: string[] = [];
  
  // Remove espaços extras e normaliza espaços
  const nomeNormalizado = nome.trim().replace(/\s+/g, ' ');
  
  // Gera diferentes variações do nome
  const variacoesNome = [
    // Nome completo com primeira letra maiúscula
    nomeNormalizado
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
      .join(''),
    // Nome completo sem espaços
    nomeNormalizado.replace(/\s+/g, ''),
    // Nome completo em minúsculas sem espaços
    nomeNormalizado.toLowerCase().replace(/\s+/g, ''),
    // Nome completo sem acentos
    removerAcentos(nomeNormalizado).replace(/\s+/g, '')
  ];

  // Trata nomes especiais dos times
  let pastaTime = time;
  if (time === 'São Paulo') {
    pastaTime = 'SãoPaulo';
  } else if (time === 'Atlético Mineiro') {
    pastaTime = 'AtléticoMineiro';
  }

  // Gera caminhos para cada variação do nome
  for (const variacao of variacoesNome) {
    caminhos.push(`/players/${pastaTime}/${variacao}.jpg`);
  }

  return caminhos;
}

export function getS3EscudoUrl(escudo: string) {
  // Novo caminho local
  const nome = escudo.replace('/escudos/', '').replace(/^\/+/, '');
  return `/escudos/${nome}`;
} 