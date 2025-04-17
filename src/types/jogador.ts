export interface Jogador {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  idade: number;
  nacionalidade: string;
  foto: string;
  quantidade: number;
  time: {
    nome: string;
    escudo: string;
  };
} 