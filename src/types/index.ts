export interface Jogador {
  id: string;
  nome: string;
  numero: number | null;
  posicao: string | null;
  nacionalidade: string | null;
  foto: string | null;
  raridade: string;
  time: {
    id: string;
    nome: string;
    escudo: string | null;
  };
}

export interface Figurinha {
  id: string;
  jogador: Jogador;
  quantidade: number;
  raridade: string;
} 