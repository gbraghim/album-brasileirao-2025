'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';

const TIMES_SERIE_A: Time[] = [
  { id: '1', nome: 'Atlético Mineiro', escudo: '/escudos/atletico_mg.png' },
  { id: '2', nome: 'Bahia', escudo: '/escudos/bahia.png' },
  { id: '3', nome: 'Botafogo', escudo: '/escudos/botafogo.png' },
  { id: '4', nome: 'Bragantino', escudo: '/escudos/bragantino.png' },
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
].sort((a, b) => a.nome.localeCompare(b.nome));

interface Figurinha {
  id: string;
  quantidade: number;
}

interface Jogador {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  nacionalidade: string;
  time: Time;
  figurinhas?: Figurinha[];
  dataNascimento?: string;
  altura?: number;
  peso?: number;
}

interface AlbumResponse {
  jogadores: Jogador[];
}

interface Time {
  id: string;
  nome: string;
  escudo: string;
}

interface TotalJogadoresTime {
  [timeId: string]: number;
}

export default function MeuAlbum() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [timeSelecionado, setTimeSelecionado] = useState<Time | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalJogadoresTime, setTotalJogadoresTime] = useState<TotalJogadoresTime>({});
  const [timesOrdenados, setTimesOrdenados] = useState<Time[]>(TIMES_SERIE_A);

  const formatarNomeArquivo = (nome: string): string => {
    // Remove espaços e mantém as letras maiúsculas e minúsculas como estão
    return nome.replace(/\s+/g, '');
  };

  const formatarCaminhoImagem = (time: string, jogador: string): string => {
    const timeFormatado = time.replace(/\s+/g, '');
    const jogadorFormatado = formatarNomeArquivo(jogador);
    return `/players/${timeFormatado}/${jogadorFormatado}.jpg`;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchJogadores();
      fetchTotalJogadoresTime();
    }
  }, [status, router]);

  useEffect(() => {
    // Reordena os times quando um time é selecionado
    if (timeSelecionado) {
      console.log('Reordenando times - Time selecionado:', timeSelecionado.nome);
      
      const timesRestantes = TIMES_SERIE_A
        .filter(time => time.id !== timeSelecionado.id)
        .sort((a, b) => a.nome.localeCompare(b.nome));
      
      const novaOrdem = [timeSelecionado, ...timesRestantes];
      console.log('Nova ordem dos times:', novaOrdem.map(t => t.nome));
      
      setTimesOrdenados(novaOrdem);
    } else {
      console.log('Nenhum time selecionado, ordenando alfabeticamente');
      setTimesOrdenados([...TIMES_SERIE_A].sort((a, b) => a.nome.localeCompare(b.nome)));
    }
  }, [timeSelecionado]);

  const fetchJogadores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/meu-album');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao carregar álbum' }));
        throw new Error(errorData.error || 'Erro ao carregar álbum');
      }

      const data = await response.json() as AlbumResponse;
      
      if (!data.jogadores) {
        throw new Error('Dados inválidos recebidos do servidor');
      }

      setJogadores(data.jogadores);
      
      // Seleciona o primeiro time da lista por padrão
      if (TIMES_SERIE_A.length > 0) {
        setTimeSelecionado(TIMES_SERIE_A[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar álbum:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar álbum');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalJogadoresTime = async () => {
    try {
      const response = await fetch('/api/total-jogadores-time');
      if (!response.ok) {
        throw new Error('Erro ao carregar total de jogadores por time');
      }
      const data = await response.json();
      setTotalJogadoresTime(data);
    } catch (err) {
      console.error('Erro ao carregar total de jogadores por time:', err);
    }
  };

  const jogadoresDoTime = timeSelecionado ? jogadores.filter(
    (jogador) => jogador.time.id === timeSelecionado.id
  ) : [];

  const totalJogadores = timeSelecionado ? (totalJogadoresTime[timeSelecionado.id] || 0) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchJogadores();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Meu Álbum</h1>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Lista de Times */}
          <div className="w-full md:w-1/4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-brasil-blue">Times</h2>
            <div className="space-y-2 md:space-y-3">
              {timesOrdenados.map((time) => (
                <button
                  key={time.id}
                  onClick={() => setTimeSelecionado(time)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all w-full ${
                    timeSelecionado?.id === time.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="w-24 h-24 flex items-center justify-center">
                    <Image
                      src={time.escudo}
                      alt={time.nome}
                      width={2048}
                      height={2048}
                      className="object-contain p-2 w-full h-full"
                    />
                  </div>
                  <span className="text-sm mt-2 text-brasil-blue font-medium">{time.nome}</span>
                  <span className="text-xs text-brasil-blue">
                    {jogadores.filter((j) => j.time.id === time.id).length} /{' '}
                    {totalJogadoresTime[time.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Jogadores */}
          <div className="w-full md:w-3/4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
              {timeSelecionado && (
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-brasil-blue">{timeSelecionado.nome}</h2>
                  <p className="text-sm md:text-base text-brasil-green">
                    {jogadoresDoTime.length} / {totalJogadores} jogadores no álbum
                  </p>
                </div>
              )}

              {jogadoresDoTime.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {jogadoresDoTime.map((jogador) => (
                    <div 
                      key={jogador.id}
                      className="bg-white/50 p-3 md:p-4 rounded-lg border border-brasil-yellow/20 relative transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <div className="flex flex-col">
                        <div className="mb-3 w-full h-48 relative">
                          <Image
                            src={formatarCaminhoImagem(jogador.time.nome, jogador.nome)}
                            alt={jogador.nome}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex flex-col space-y-1 md:space-y-2">
                          <h3 className="text-sm md:text-base font-bold text-brasil-blue truncate">{jogador.nome}</h3>
                          <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className="bg-brasil-green/10 px-2 py-1 rounded-full text-brasil-green">#{jogador.numero}</span>
                            <span className="bg-brasil-yellow/10 px-2 py-1 rounded-full text-brasil-yellow">{jogador.posicao}</span>
                          </div>
                          <div className="flex flex-col space-y-1 text-xs md:text-sm">
                            <span className="text-gray-600">{jogador.nacionalidade}</span>
                            {jogador.dataNascimento && (
                              <span className="text-gray-600">
                                {new Date(jogador.dataNascimento).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            {jogador.altura && (
                              <span className="text-gray-600">{jogador.altura}cm</span>
                            )}
                          </div>
                          {jogador.figurinhas?.some(f => f.quantidade > 1) && (
                            <div className="mt-2 text-xs bg-brasil-blue/10 px-2 py-1 rounded text-brasil-blue">
                              <Link href="/repetidas" className="hover:underline">
                                {jogador.figurinhas?.reduce((total, f) => total + (f.quantidade - 1), 0)} repetida(s)
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-brasil-blue text-lg mb-4">Você ainda não tem nenhuma figurinha do {timeSelecionado?.nome}!</p>
                  <Link 
                    href="/pacotes"
                    className="inline-block bg-brasil-yellow text-brasil-blue font-bold py-2 px-6 rounded-lg hover:bg-brasil-yellow/80 transition-colors"
                  >
                    Abrir Pacotes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 