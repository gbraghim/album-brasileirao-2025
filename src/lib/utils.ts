export const formatarNomeArquivo = (nome: string): string => {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ''); // Remove espaços
};

export const formatarCaminhoImagem = (time: string, jogador: string): string => {
  const timeFormatado = time; // Mantém o nome original do time
  const jogadorFormatado = formatarNomeArquivo(jogador);
  return `/players/${timeFormatado}/${jogadorFormatado}.jpg`;
}; 