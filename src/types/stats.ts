export interface UserStats {
  totalPacotes: number;
  totalFigurinhas: number;
  figurinhasRepetidas: number;
  timesCompletos: number;
  totalTimes: number;
  totalJogadoresBase: number;
  figurinhasLendarias: number;
  totalFigurinhasLendarias: number;
  figurinhasOuro: number;
  totalFigurinhasOuro: number;
  figurinhasPrata: number;
  totalFigurinhasPrata: number;
  timesDetalhados?: { nome: string; completo: boolean; figurinhasObtidas: number; totalFigurinhas: number }[];
  totalUsuarios: number;
}

export interface TimeStats {
  nome: string;
  totalFigurinhas: number;
  figurinhasObtidas: number;
  completo: boolean;
} 