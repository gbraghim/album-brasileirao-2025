export const TIMES_SERIE_A = [
  { id: '1', nome: 'Atlético Mineiro', escudo: '/escudos/atletico_mg.png' },
  { id: '2', nome: 'Bahia', escudo: '/escudos/bahia.png' },
  { id: '3', nome: 'Botafogo', escudo: '/escudos/botafogo.png' },
  { id: '4', nome: 'Red Bull Bragantino', escudo: '/escudos/bragantino.png' },
  { id: '5', nome: 'Ceará', escudo: '/escudos/ceara.png' },
  { id: '6', nome: 'Corinthians', escudo: '/escudos/corinthians.png' },
  { id: '7', nome: 'Cruzeiro', escudo: '/escudos/cruzeiro.png' },
  { id: '8', nome: 'Flamengo', escudo: '/escudos/flamengo.png' },
  { id: '9', nome: 'Fluminense', escudo: '/escudos/fluminense.png' },
  { id: '10', nome: 'Fortaleza', escudo: '/escudos/fortaleza.png' },
  { id: '11', nome: 'Grêmio', escudo: '/escudos/gremio.png' },
  { id: '12', nome: 'Internacional', escudo: '/escudos/internacional.png' },
  { id: '13', nome: 'Juventude', escudo: '/escudos/juventude.png' },
  { id: '14', nome: 'Mirassol', escudo: '/escudos/mirassol.png' },
  { id: '15', nome: 'Palmeiras', escudo: '/escudos/palmeiras.png' },
  { id: '16', nome: 'Santos', escudo: '/escudos/santos.png' },
  { id: '17', nome: 'São Paulo', escudo: '/escudos/sao_paulo.png' },
  { id: '18', nome: 'Sport', escudo: '/escudos/sport.png' },
  { id: '19', nome: 'Vasco', escudo: '/escudos/vasco.png' },
  { id: '20', nome: 'Vitória', escudo: '/escudos/vitoria.png' }
] as const;

export interface Time {
  id: string;
  nome: string;
  escudo: string;
} 