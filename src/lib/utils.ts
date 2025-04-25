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
  // Remove espaços e acentos do nome
  const nomeSemEspacos = nome.replace(/\s+/g, '');
  const nomeSemAcentos = removerAcentos(nomeSemEspacos);
  const nomeMinusculo = nomeSemAcentos.toLowerCase();
  
  // Trata nomes especiais dos times
  let pastaTime = time;
  if (time === 'São Paulo') {
    pastaTime = 'SãoPaulo';
  } else if (time === 'Atlético Mineiro') {
    pastaTime = 'AtléticoMineiro';
  }
  
  // Gera os caminhos na ordem de prioridade
  const caminhos = [
    // Primeiro tenta o nome exato como está no arquivo
    `/players/${pastaTime}/${nomeSemEspacos}.jpg`,
    `/players/${pastaTime}/${nomeSemAcentos}.jpg`,
    `/players/${pastaTime}/${nomeMinusculo}.jpg`,
    
    // Depois tenta com .jpeg
    `/players/${pastaTime}/${nomeSemEspacos}.jpeg`,
    `/players/${pastaTime}/${nomeSemAcentos}.jpeg`,
    `/players/${pastaTime}/${nomeMinusculo}.jpeg`,
    
    // Tenta versões com acentos
    `/players/${pastaTime}/${nome}.jpg`,
    `/players/${pastaTime}/${nome}.jpeg`,
    
    // Tenta versões com primeira letra maiúscula
    `/players/${pastaTime}/${nomeSemEspacos.charAt(0).toUpperCase() + nomeSemEspacos.slice(1)}.jpg`,
    `/players/${pastaTime}/${nomeSemAcentos.charAt(0).toUpperCase() + nomeSemAcentos.slice(1)}.jpg`,
    
    // Tenta versões com todas as letras maiúsculas
    `/players/${pastaTime}/${nomeSemEspacos.toUpperCase()}.jpg`,
    `/players/${pastaTime}/${nomeSemAcentos.toUpperCase()}.jpg`,
    
    // Tenta versões com todas as letras minúsculas
    `/players/${pastaTime}/${nomeSemEspacos.toLowerCase()}.jpg`,
    `/players/${pastaTime}/${nomeSemAcentos.toLowerCase()}.jpg`
  ];
  
  // Remove duplicatas mantendo a ordem
  const caminhosUnicos = Array.from(new Set(caminhos));
  
  console.log(`Caminhos gerados para ${nome} do ${time}:`, caminhosUnicos);
  return caminhosUnicos;
} 