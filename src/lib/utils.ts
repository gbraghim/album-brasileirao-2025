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
  const nomesFormatados = formatarNomeArquivo(nome);
  const caminhos: string[] = [];
  
  // Variações do nome do time (com e sem acentos, maiúsculas e minúsculas)
  const timesFormatados = formatarNomeArquivo(time);
  
  for (const timeFormatado of timesFormatados) {
    for (const nomeFormatado of nomesFormatados) {
      caminhos.push(
        `/players/${timeFormatado}/${nomeFormatado}.jpg`,
        `/players/${timeFormatado}/${nomeFormatado}.jpeg`
      );
    }
  }
  
  console.log(`Caminhos gerados para ${nome} do ${time}:`, caminhos);
  return caminhos;
} 