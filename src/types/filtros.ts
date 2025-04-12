import { Dispatch, SetStateAction } from 'react';
import { Jogador } from './jogador';
import { Pacote } from './pacote';

export interface Filtros {
  time: string;
  posicao: string;
  raridade: string;
  search: string;
}

export interface FiltrosAlbumProps {
  jogadores: Jogador[];
  filtros: Filtros;
  setFiltros: Dispatch<SetStateAction<Filtros>>;
}

export interface FiltrosPacotesProps {
  pacotes: Pacote[];
  filtros: Filtros;
  setFiltros: Dispatch<SetStateAction<Filtros>>;
} 