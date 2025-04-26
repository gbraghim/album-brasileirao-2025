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
}

export interface TimeStats {
  nome: string;
  totalFigurinhas: number;
  figurinhasObtidas: number;
  completo: boolean;
} 