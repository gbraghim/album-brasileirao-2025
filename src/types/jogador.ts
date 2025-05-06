export interface Jogador {
  id: string;
  nome: string;
  numero: number | null;
  posicao: string | null;
  nacionalidade: string | null;
  foto: string | null;
  quantidade: number;
  time: {
    id: string;
    nome: string;
    escudo: string | null;
  };
} 