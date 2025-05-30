'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { formatarCaminhoImagem, getS3EscudoUrl } from '@/lib/utils';
import FigurinhaCard from '@/components/FigurinhaCard';
import ProdutosFigurinha from '@/components/ProdutosFigurinha';
import Loading from '@/components/loading';

export const dynamic = 'force-dynamic';

const TIMES_SERIE_A = [
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
];

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
  raridade: string;
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
    <Suspense fallback={<Loading />}>
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
  const [timesOrdenados, setTimesOrdenados] = useState<Time[]>(TIMES_SERIE_A.sort((a, b) => a.nome.localeCompare(b.nome)));
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [escudoErrors, setEscudoErrors] = useState<Record<string, boolean>>({});
  const [figurinhasEmTroca, setFigurinhasEmTroca] = useState<string[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [showProdutos, setShowProdutos] = useState(false);

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

  const handleEscudoError = (timeId: string) => {
    console.error(`Erro ao carregar escudo do time ${timeId}`);
    setEscudoErrors(prev => ({
      ...prev,
      [timeId]: true
    }));
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
      fetchFigurinhasEmTroca();
      fetchProdutos();

      // Adiciona o ouvinte de evento para atualizar o estado quando uma troca é removida
      const handleTrocaRemovida = (event: CustomEvent<{ figurinhaId: string }>) => {
        setFigurinhasEmTroca(prev => prev.filter(id => id !== event.detail.figurinhaId));
      };

      window.addEventListener('trocaRemovida', handleTrocaRemovida as EventListener);

      return () => {
        window.removeEventListener('trocaRemovida', handleTrocaRemovida as EventListener);
      };
    }
  }, [status, router]);

  // Efeito para carregar o time da URL quando a página carrega
  useEffect(() => {
    const timeId = searchParams ? searchParams.get('time') : null;
    if (timeId) {
      const time = TIMES_SERIE_A.find(t => t.id === timeId);
      if (time) {
        setTimeSelecionado(time);
      }
    }
  }, [searchParams]);

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
      if (TIMES_SERIE_A.length > 0 && !(searchParams && searchParams.get('time'))) {
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

  const fetchFigurinhasEmTroca = async () => {
    try {
      const response = await fetch('/api/trocas');
      if (!response.ok) {
        throw new Error('Erro ao buscar trocas');
      }
      const data = await response.json();
      
      // Extrair IDs das figurinhas em troca
      const figurinhasEmTrocaIds = new Set([
        ...(data.minhasTrocas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
        ...(data.trocasRecebidas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
        ...(data.trocasDisponiveis || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
        ...(data.ofertasEnviadas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean)
      ]);
      setFigurinhasEmTroca(Array.from(figurinhasEmTrocaIds));
    } catch (err) {
      console.error('Erro ao buscar figurinhas em troca:', err);
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos-figurinha');
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos');
      }
      const data = await response.json();
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
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
      
      // Se ambos estão coletados ou ambos não estão, ordena por raridade
      const ordemRaridade: Record<string, number> = {
        'Lendário': 0,
        'Ouro': 1,
        'Prata': 2
      };
      
      // Garante que a raridade seja tratada como string e normalize o valor
      const raridadeA = ordemRaridade[String(a.raridade).trim()] ?? 2;
      const raridadeB = ordemRaridade[String(b.raridade).trim()] ?? 2;
      
      if (raridadeA !== raridadeB) {
        return raridadeA - raridadeB;
      }
      
      // Se a raridade for igual, ordena por nome
      return a.nome.localeCompare(b.nome);
    }) : [];

  const totalJogadores = timeSelecionado ? (totalJogadoresTime[timeSelecionado.id] || 0) : 0;

  if (loading) {
    return <Loading />;
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-brasil-blue">Meu Álbum</h1>
            <div className="flex-1 flex items-center justify-start">
              <span className="bg-white/80 border border-brasil-blue/20 rounded-lg px-4 py-2 text-brasil-blue font-semibold text-sm md:text-base shadow">
                Você colecionou {jogadores.length} de {todosJogadores.length} figurinhas, corra para conseguir mais!!
              </span>
            </div>
            <button
              onClick={() => setShowProdutos(!showProdutos)}
              className="bg-brasil-green text-white px-4 py-2 rounded-lg hover:bg-brasil-green/90 transition-colors"
            >
              {showProdutos ? 'Ver Álbum' : 'Comprar Jogadores Desejados'}
            </button>
          </div>
        </div>

        {showProdutos ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-brasil-yellow/20">
            <h2 className="text-xl font-bold text-brasil-blue mb-6">
              Comprar Jogadores Desejados
            </h2>
            <ProdutosFigurinha produtos={produtos} />
          </div>
        ) : (
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
                            src={escudoErrors[time.id] ? '/public/placeholder.jpg' : getS3EscudoUrl(time.escudo)}
                            alt={time.nome}
                            fill
                            sizes="(max-width: 640px) 2rem, 2.5rem"
                            className="object-contain"
                            onError={() => handleEscudoError(time.id)}
                          />
                        </div>
                        <span className={`font-medium ${
                          timeSelecionado?.id === time.id ? 'text-white' : 'text-brasil-blue'
                        } text-left block`}>
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
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="flex justify-between w-full items-center" style={{ position: 'relative' }}>
                      <select
                        value={timeSelecionado?.id || ''}
                        onChange={(e) => {
                          const time = TIMES_SERIE_A.find(t => t.id === e.target.value);
                          if (time) {
                            setTimeSelecionado(time);
                            atualizarTimeURL(time);
                          }
                        }}
                        className="text-lg font-semibold text-brasil-blue px-3 py-1 rounded-md bg-white/30 border border-brasil-blue/10 focus:ring-1 focus:ring-brasil-blue/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:bg-white/50 transition-all"
                      >
                        {TIMES_SERIE_A.map((time) => (
                          <option key={time.id} value={time.id} className="bg-white text-brasil-blue text-base">
                            {time.nome}
                          </option>
                        ))}
                      </select>
                      <svg
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M6 8L10 12L14 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-brasil-blue/80 text-sm md:text-base">
                      <Link href="/pacotes" className="text-brasil-blue font-semibold hover:underline">
                        Adquira mais pacotes, colecione mais figurinhas e complete seu álbum!
                      </Link>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-6 p-2 md:p-4">
                    {jogadoresDoTime.map((jogador) => {
                      const jogadorColetado = jogadores.some(j => j.id === jogador.id);
                      const currentIndex = currentImageIndex[jogador.id] || 0;
                      return (
                        <div key={jogador.id} className="relative">
                          <div className={` ${jogadorColetado}`}>
                            <FigurinhaCard
                              jogador={jogador}
                              jogadorColetado={jogadorColetado}
                              onAdicionarRepetida={() => {}}
                              currentImageIndex={0}
                              onImageError={() => {}}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 