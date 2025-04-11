'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

export default function Repetidas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  // const [timeSelecionado, setTimeSelecionado] = useState('');
  // const [times, setTimes] = useState<{ nome: string }[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      carregarJogadores();
      // carregarTimes();
    }
  }, [status, router]);

  // const carregarTimes = async () => {
  //   try {
  //     const response = await fetch('/api/times');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setTimes(data);
  //     }
  //   } catch (err) {
  //     console.error('Erro ao carregar times:', err);
  //   }
  // };

  const carregarJogadores = async () => {
    try {
      const response = await fetch('/api/meu-album', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar jogadores');
      }

      const data = await response.json();
      // Filtra apenas jogadores com quantidade > 1
      const jogadoresRepetidos = data.jogadores.filter((j: Jogador) => j.quantidade > 1);
      setJogadores(jogadoresRepetidos);
    } catch (err) {
      setError('Erro ao carregar jogadores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const jogadoresFiltrados = jogadores.filter(jogador => {
    const matchNome = jogador.nome.toLowerCase().includes(filtro.toLowerCase());
    // const matchTime = !timeSelecionado || jogador.time.nome === timeSelecionado;
    // return matchNome && matchTime;
    return matchNome;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brasil-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-brasil-blue mb-8">Figurinhas Repetidas</h1>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar jogador..."
                className="w-full px-4 py-2 rounded-lg bg-white/90 border border-brasil-yellow focus:outline-none focus:ring-2 focus:ring-brasil-green"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            {/* Comentado temporariamente
            <div className="w-full md:w-64">
              <select
                className="w-full px-4 py-2 rounded-lg bg-white/90 border border-brasil-yellow focus:outline-none focus:ring-2 focus:ring-brasil-green"
                value={timeSelecionado}
                onChange={(e) => setTimeSelecionado(e.target.value)}
              >
                <option value="">Todos os times</option>
                {times.map((time) => (
                  <option key={time.nome} value={time.nome}>
                    {time.nome}
                  </option>
                ))}
              </select>
            </div>
            */}
          </div>

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
                        {jogador.time.escudo && (
                          <Image
                            src={jogador.time.escudo}
                            alt={jogador.time.nome}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{jogador.nome}</h3>
                        <p className="text-sm text-gray-500">{jogador.time.nome}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-gray-700">#{jogador.numero}</span>
                      <span className="text-sm text-gray-500">x{jogador.quantidade - 1} repetidas</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Posição: {jogador.posicao}</p>
                    <p>Idade: {jogador.idade} anos</p>
                    <p>Nacionalidade: {jogador.nacionalidade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 