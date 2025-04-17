'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

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
  time: {
    id: string;
    nome: string;
    escudo?: string;
  };
  figurinhas: Figurinha[];
}

interface AlbumResponse {
  jogadores: Jogador[];
}

interface Time {
  id: string;
  nome: string;
  escudo?: string;
}

interface TotalJogadoresTime {
  [timeId: string]: number;
}

export default function MeuAlbum() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [times, setTimes] = useState<Time[]>([]);
  const [timeSelecionado, setTimeSelecionado] = useState<Time | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalJogadoresTime, setTotalJogadoresTime] = useState<TotalJogadoresTime>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchJogadores();
      fetchTotalJogadoresTime();
    }
  }, [status, router]);

  const fetchJogadores = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando busca de jogadores');
      
      const response = await fetch('/api/meu-album');
      console.log('Resposta recebida:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao carregar álbum' }));
        console.error('Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao carregar álbum');
      }

      const data = await response.json() as AlbumResponse;
      console.log('Dados recebidos:', data);
      
      if (!data.jogadores) {
        throw new Error('Dados inválidos recebidos do servidor');
      }

      setJogadores(data.jogadores);
      
      // Extrair times únicos e ordenar alfabeticamente
      const timesUnicos = Array.from(
        new Set(data.jogadores.map(j => j.time.nome))
      ).map(nomeTime => {
        const jogador = data.jogadores.find(j => j.time.nome === nomeTime);
        if (!jogador) return null;
        return {
          id: jogador.time.id,
          nome: jogador.time.nome,
          escudo: jogador.time.escudo
        };
      })
      .filter((time): time is NonNullable<typeof time> => time !== null)
      .sort((a, b) => a.nome.localeCompare(b.nome));
      
      console.log('Times processados:', timesUnicos);
      setTimes(timesUnicos);
      if (timesUnicos.length > 0) {
        setTimeSelecionado(timesUnicos[0]);
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

  const jogadoresDoTime = timeSelecionado 
    ? jogadores.filter(jogador => jogador.time.nome === timeSelecionado.nome)
    : [];

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
          <div className="w-full md:w-64 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-brasil-blue">Times</h2>
            <div className="space-y-2 md:space-y-3">
              {times.map((time) => (
                <button
                  key={time.id}
                  onClick={() => setTimeSelecionado(time)}
                  className={`w-full text-left p-2 md:p-3 rounded-lg transition-colors ${
                    timeSelecionado?.id === time.id
                      ? 'bg-brasil-blue text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 md:space-x-3">
                    {time.escudo && (
                      <img
                        src={time.escudo}
                        alt={time.nome}
                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                      />
                    )}
                    <span className="text-sm md:text-base">{time.nome}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Jogadores */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
              {timeSelecionado && (
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-brasil-blue">{timeSelecionado.nome}</h2>
                  <p className="text-sm md:text-base text-brasil-green">
                    {jogadoresDoTime.length} / {totalJogadoresTime[timeSelecionado.id] || '?'} jogadores no álbum
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {jogadoresDoTime.map((jogador) => (
                  <div 
                    key={jogador.id}
                    className="bg-white/50 p-3 md:p-4 rounded-lg border border-brasil-yellow/20 relative transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex flex-col">
                      <div className="flex flex-col space-y-1 md:space-y-2">
                        <h3 className="text-sm md:text-base font-bold text-brasil-blue">{jogador.nome}</h3>
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-brasil-green">#{jogador.numero}</span>
                          <span className="text-brasil-yellow">{jogador.posicao}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>{jogador.nacionalidade}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 