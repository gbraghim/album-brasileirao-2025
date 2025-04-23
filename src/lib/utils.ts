export function formatarNomeArquivo(nome: string): string {
  return nome.replace(/\s+/g, '');
}

export function formatarCaminhoImagem(nomeTime: string, nomeJogador: string): string[] {
  const nomeJogadorFormatado = formatarNomeArquivo(nomeJogador);
  return [
    `/players/${nomeTime}/${nomeJogadorFormatado}.png`,
    `/players/${nomeTime}/${nomeJogadorFormatado}.jpg`,
    `/players/${nomeTime}/${nomeJogadorFormatado}.jpeg`,
    `/players/${nomeTime}/${nomeJogadorFormatado}.webp`
  ];
} 