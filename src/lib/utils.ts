export function formatarNomeArquivo(nome: string): string {
  return nome.replace(/\s+/g, '');
}

export function formatarCaminhoImagem(time: string, nome: string): string[] {
  const nomeFormatado = formatarNomeArquivo(nome);
  return [
    `/players/${time}/${nomeFormatado}.png`,
    `/players/${time}/${nomeFormatado}.jpg`,
    `/players/${time}/${nomeFormatado}.jpeg`,
    `/players/${time}/${nomeFormatado}.webp`
  ];
} 