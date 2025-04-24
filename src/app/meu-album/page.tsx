'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';

const TIMES_SERIE_A: Time[] = [
  { id: '1', nome: 'Atlético Mineiro', escudo: '/escudos/atletico_mg.png' },
  { id: '2', nome: 'Bahia', escudo: '/escudos/bahia.png' },
  { id: '3', nome: 'Botafogo', escudo: '/escudos/Botafogo.png' },
  { id: '4', nome: 'Bragantino', escudo: '/escudos/Bragantino.png' },
  { id: '5', nome: 'Ceará', escudo: '/escudos/ceara.png' },
  { id: '6', nome: 'Corinthians', escudo: '/escudos/corinthians.png' },
  { id: '7', nome: 'Cruzeiro', escudo: '/escudos/cruzeiro.png' },
  { id: '8', nome: 'Flamengo', escudo: '/escudos/flamengo.png' },
  { id: '9', nome: 'Fluminense', escudo: '/escudos/fluminense.png' },
  { id: '10', nome: 'Fortaleza', escudo: '/escudos/Fortaleza.png' },
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
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MeuAlbumContent />
    </Suspense>
  );
}

function MeuAlbumContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [todosJogadores, setTodosJogadores] = useState<Jogador[]>([]);
  const [timeSelecionado, setTimeSelecionado] = useState<Time | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalJogadoresTime, setTotalJogadoresTime] = useState<TotalJogadoresTime>({});
  const [timesOrdenados, setTimesOrdenados] = useState<Time[]>(TIMES_SERIE_A);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (jogadorId: string, time: string, nome: string) => {
    const caminhos = formatarCaminhoImagem(time, nome);
    const currentIndex = currentImageIndex[jogadorId] || 0;
    
    if (currentIndex < caminhos.length - 1) {
      console.log(`Tentando próximo formato para ${nome} do ${time}: ${caminhos[currentIndex + 1]}`);
      setCurrentImageIndex(prev => ({
        ...prev,
        [jogadorId]: currentIndex + 1
      }));
    } else {
      console.error(`Todos os formatos falharam para ${nome} do ${time}`);
      setImageErrors(prev => ({
        ...prev,
        [jogadorId]: true
      }));
    }
  };

  // Função para atualizar a URL quando um time é selecionado
  const atualizarTimeURL = (time: Time) => {
    const url = new URL(window.location.href);
    url.searchParams.set('time', time.id);
    window.history.pushState({}, '', url.toString());
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchJogadores();
      fetchTodosJogadores();
      fetchTotalJogadoresTime();
    }
  }, [status, router]);

  // Efeito para carregar o time da URL quando a página carrega
  useEffect(() => {
    const timeId = searchParams.get('time');
    if (timeId) {
      const time = TIMES_SERIE_A.find(t => t.id === timeId);
      if (time) {
        setTimeSelecionado(time);
      }
    }
  }, [searchParams]);

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
      
      // Seleciona o primeiro time da lista por padrão apenas se não houver time na URL
      if (TIMES_SERIE_A.length > 0 && !searchParams.get('time')) {
        const primeiroTime = TIMES_SERIE_A[0];
        setTimeSelecionado(primeiroTime);
        atualizarTimeURL(primeiroTime);
      }
    } catch (err) {
      console.error('Erro ao carregar álbum:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar álbum');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodosJogadores = async () => {
    try {
      const response = await fetch('/api/jogadores');
      if (!response.ok) {
        throw new Error('Erro ao carregar todos os jogadores');
      }
      const data = await response.json();
      setTodosJogadores(data);
    } catch (err) {
      console.error('Erro ao carregar todos os jogadores:', err);
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

  const jogadoresDoTime = timeSelecionado ? todosJogadores
    .filter((jogador) => jogador.time.id === timeSelecionado.id)
    .sort((a, b) => {
      // Primeiro, verifica se o jogador está na coleção
      const aColetado = jogadores.some(j => j.id === a.id);
      const bColetado = jogadores.some(j => j.id === b.id);
      
      // Se um está coletado e outro não, o coletado vem primeiro
      if (aColetado && !bColetado) return -1;
      if (!aColetado && bColetado) return 1;
      
      // Se ambos estão coletados ou ambos não estão, ordena por nome
      return a.nome.localeCompare(b.nome);
    }) : [];

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
              {timesOrdenados.map((time) => {
                const jogadoresColetados = jogadores.filter(
                  (jogador) => jogador.time.id === time.id
                ).length;
                const totalJogadores = totalJogadoresTime[time.id] || 0;

                return (
                  <button
                    key={time.id}
                    onClick={() => {
                      setTimeSelecionado(time);
                      atualizarTimeURL(time);
                    }}
                    className={`w-full flex items-center justify-between p-2 md:p-3 rounded-lg transition-all duration-300 ${
                      timeSelecionado?.id === time.id
                        ? 'bg-brasil-green text-white'
                        : 'hover:bg-brasil-green/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="relative w-8 h-8 md:w-10 md:h-10">
                        <Image
                          src={time.escudo}
                          alt={time.nome}
                          fill
                          sizes="(max-width: 640px) 2rem, 2.5rem"
                          className="object-contain"
                        />
                      </div>
                      <span className={`font-medium ${
                        timeSelecionado?.id === time.id ? 'text-white' : 'text-brasil-blue'
                      }`}>
                        {time.nome}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      timeSelecionado?.id === time.id ? 'text-white' : 'text-brasil-blue'
                    }`}>
                      {jogadoresColetados}/{totalJogadores}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Jogadores */}
          <div className="w-full md:w-3/4">
            {timeSelecionado && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-brasil-blue">
                    {timeSelecionado.nome}
                  </h2>
                  <span className="text-sm text-brasil-blue">
                    {jogadores.filter((j) => j.time.id === timeSelecionado.id).length} de {totalJogadores} figurinhas
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {jogadoresDoTime.map((jogador) => {
                    const jogadorColetado = jogadores.some(j => j.id === jogador.id);
                    const figurinha = jogadorColetado ? jogadores.find(j => j.id === jogador.id) : null;
                    
                    return (
                      <div
                        key={jogador.id}
                        className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                          !jogadorColetado ? 'opacity-70 grayscale hover:opacity-90 hover:grayscale-[0.5]' : ''
                        }`}
                        onClick={() => !jogadorColetado && router.push('/pacotes')}
                      >
                        <div className="relative w-full aspect-[3/4] mb-2 max-w-[200px] mx-auto">
                          {imageErrors[jogador.id] ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                              <span className="text-gray-500">Imagem não disponível</span>
                            </div>
                          ) : (
                            <Image
                              src={formatarCaminhoImagem(jogador.time.nome, jogador.nome)[currentImageIndex[jogador.id] || 0]}
                              alt={`${jogador.nome} - ${jogador.time.nome}`}
                              fill
                              className="object-cover rounded-lg"
                              sizes="(max-width: 640px) 200px, (max-width: 1024px) 200px, 200px"
                              priority
                              onError={() => handleImageError(jogador.id, jogador.time.nome, jogador.nome)}
                            />
                          )}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-sm font-medium truncate">
                            {jogador.nome}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-white/80 text-xs">
                              {jogador.posicao}
                            </span>
                            {jogadorColetado ? (
                              figurinha?.figurinhas && figurinha.figurinhas.length > 1 && (
                                <span className="text-brasil-yellow text-xs font-medium">
                                  x{figurinha.figurinhas.length}
                                </span>
                              )
                            ) : null}
                          </div>
                        </div>
                        {!jogadorColetado && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                            <span className="bg-brasil-blue text-brasil-white text-sm font-bold px-4 py-2 rounded-full transform scale-90 group-hover:scale-100 transition-transform duration-300">
                              Colecionar!
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 