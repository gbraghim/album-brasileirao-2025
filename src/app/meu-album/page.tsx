'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Jogador {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  idade: number;
  nacionalidade: string;
  foto: string;
  quantidade: number;
  time: {
    nome: string;
    escudo: string;
  };
}

interface Filtros {
  time: string;
  nacionalidade: string;
  posicao: string;
}

export default function MeuAlbum() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<Filtros>({
    time: '',
    nacionalidade: '',
    posicao: ''
  });
  const [times, setTimes] = useState<string[]>([]);
  const [nacionalidades, setNacionalidades] = useState<string[]>([]);
  const [posicoes, setPosicoes] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      carregarJogadores();
    }
  }, [status, router]);

  const carregarJogadores = async () => {
    try {
      const response = await fetch('/api/meu-album', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Erro ao carregar álbum');
      }

      const data = await response.json();
      setJogadores(data.jogadores);

      // Extrair valores únicos para os filtros
      const timesUnicos = Array.from(new Set(data.jogadores.map((j: Jogador) => j.time.nome))) as string[];
      const nacionalidadesUnicas = Array.from(new Set(data.jogadores.map((j: Jogador) => j.nacionalidade))) as string[];
      const posicoesUnicas = Array.from(new Set(data.jogadores.map((j: Jogador) => j.posicao))) as string[];

      setTimes(timesUnicos);
      setNacionalidades(nacionalidadesUnicas);
      setPosicoes(posicoesUnicas);
    } catch (error) {
      console.error('Erro ao carregar álbum:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const jogadoresFiltrados = jogadores.filter(jogador => {
    if (filtros.time && jogador.time.nome !== filtros.time) return false;
    if (filtros.nacionalidade && jogador.nacionalidade !== filtros.nacionalidade) return false;
    if (filtros.posicao && jogador.posicao !== filtros.posicao) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Álbum</h1>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  id="time"
                  name="time"
                  value={filtros.time}
                  onChange={handleFiltroChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todos os times</option>
                  {times.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="nacionalidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Nacionalidade
                </label>
                <select
                  id="nacionalidade"
                  name="nacionalidade"
                  value={filtros.nacionalidade}
                  onChange={handleFiltroChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todas as nacionalidades</option>
                  {nacionalidades.map(nacionalidade => (
                    <option key={nacionalidade} value={nacionalidade}>{nacionalidade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="posicao" className="block text-sm font-medium text-gray-700 mb-1">
                  Posição
                </label>
                <select
                  id="posicao"
                  name="posicao"
                  value={filtros.posicao}
                  onChange={handleFiltroChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Todas as posições</option>
                  {posicoes.map(posicao => (
                    <option key={posicao} value={posicao}>{posicao}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de jogadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jogadoresFiltrados.map((jogador) => (
              <div
                key={jogador.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="relative w-12 h-12 mr-3">
                        {jogador.time.escudo ? (
                          <Image
                            src={jogador.time.escudo}
                            alt={jogador.time.nome}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400">{jogador.time.nome[0]}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{jogador.nome}</h3>
                        <p className="text-sm text-gray-500">{jogador.time.nome}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-500">x{jogador.quantidade}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Posição: {jogador.posicao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {jogadoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum jogador encontrado com os filtros selecionados</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 