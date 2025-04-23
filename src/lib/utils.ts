export const formatarNomeArquivo = (nome: string): string => {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ''); // Remove espaços
};

export const formatarCaminhoImagem = (time: string, jogador: string): string[] => {
  const timeFormatado = time; // Mantém o nome original do time
  const extensoes = ['.jpg', '.jpeg', '.png', '.webp'];
  
  // Trata o nome do jogador de várias formas para aumentar a chance de encontrar o arquivo
  const variantes = [
    jogador.replace(/\s+/g, ''), // Remove apenas espaços
    jogador.replace(/['\s]/g, ''), // Remove espaços e apóstrofos
    formatarNomeArquivo(jogador), // Remove acentos e espaços
    formatarNomeArquivo(jogador).replace(/'/g, '') // Remove acentos, espaços e apóstrofos
  ];
  
  // Remove duplicatas usando Array.from
  const variantesUnicas = Array.from(new Set(variantes));
  
  // Gera todas as combinações possíveis de variantes de nome com extensões
  return variantesUnicas.flatMap(variante => 
    extensoes.map(ext => `/players/${timeFormatado}/${variante}${ext}`)
  );
}; 