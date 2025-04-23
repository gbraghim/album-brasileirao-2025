export function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function formatarNomeArquivo(nome: string): string[] {
  const nomeSemEspacos = nome.replace(/\s+/g, '');
  const nomeSemAcentos = removerAcentos(nomeSemEspacos);
  
  // Se o nome já estiver sem acentos, retorna apenas ele
  if (nomeSemEspacos === nomeSemAcentos) {
    return [nomeSemEspacos];
  }
  
  // Retorna tanto o nome original quanto sem acentos
  return [nomeSemEspacos, nomeSemAcentos];
}

export function formatarCaminhoImagem(time: string, nome: string): string[] {
  const nomesFormatados = formatarNomeArquivo(nome);
  const caminhos: string[] = [];
  
  for (const nomeFormatado of nomesFormatados) {
    caminhos.push(
      `/players/${time}/${nomeFormatado}.jpg`,
      `/players/${time}/${nomeFormatado}.jpeg`,
      `/players/${time}/${nomeFormatado}.png`,
      `/players/${time}/${nomeFormatado}.webp`
    );
  }
  
  console.log(`Caminhos gerados para ${nome} do ${time}:`, caminhos);
  return caminhos;
} 