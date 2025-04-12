export interface Pacote {
  id: string;
  createdAt: Date;
  userId: string;
  figurinhas: {
    id: string;
    jogadorId: string;
    raridade: string;
    jogador: {
      id: string;
      nome: string;
      posicao: string;
      time: string;
      foto: string;
    };
  }[];
} 