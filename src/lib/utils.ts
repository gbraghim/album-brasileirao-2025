export const formatarNomeArquivo = (nome: string): string => {
  return nome.replace(/\s+/g, '');
};

export const formatarCaminhoImagem = (time: string, jogador: string): string => {
  const timeFormatado = time; // Mantém o nome original do time
  const jogadorFormatado = formatarNomeArquivo(jogador);
  return `/players/${timeFormatado}/${jogadorFormatado}.jpg`;
}; 