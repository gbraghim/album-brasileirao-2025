export interface UserStats {
  totalPacotes: number;
  totalFigurinhas: number;
  figurinhasRepetidas: number;
  timesCompletos: number;
  totalTimes: number;
  totalJogadoresBase: number;
}

export interface TimeStats {
  nome: string;
  totalFigurinhas: number;
  figurinhasObtidas: number;
  completo: boolean;
} 