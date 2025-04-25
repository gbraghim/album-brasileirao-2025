'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/Modal';
import ModalProporTroca from '@/components/ModalProporTroca';
import { formatarCaminhoImagem } from '@/lib/utils';

interface Jogador {
  id: string;
  nome: string;
  posicao: string;
  numero: number;
  nacionalidade: string;
  foto?: string | null;
  time: {
    id: string;
    nome: string;
    escudo: string;
  };
}

interface Figurinha {
  id: string;
  jogador: {
    id: string;
    nome: string;
    numero: number | null;
    posicao: string | null;
    nacionalidade: string | null;
    foto: string | null;
    time: {
      id: string;
      nome: string;
      escudo: string | null;
    };
  };
  quantidade: number;
}

interface Troca {
  id: string;
  figurinhaOferta: {
    id: string;
    jogador: {
      id: string;
      nome: string;
      posicao: string;
      numero: number;
      nacionalidade: string;
      foto: string;
      time: {
        id: string;
        nome: string;
        escudo: string;
      };
    };
    quantidade: number;
  };
  figurinhaSolicitada: {
    id: string;
    jogador: {
      id: string;
      nome: string;
      posicao: string;
      numero: number;
      nacionalidade: string;
      foto: string;
      time: {
        id: string;
        nome: string;
        escudo: string;
      };
    };
  };
  usuarioEnvia: {
    id: string;
    nome: string;
  };
  usuarioRecebe: {
    id: string;
    nome: string;
  };
  status: 'PENDENTE' | 'ACEITA' | 'REJEITADA';
  createdAt: string;
}

export default function Trocas() {
  const { data: session } = useSession();
  const [minhasTrocas, setMinhasTrocas] = useState<Troca[]>([]);
  const [trocasDisponiveis, setTrocasDisponiveis] = useState<Troca[]>([]);
  const [propostasRecebidas, setPropostasRecebidas] = useState<Troca[]>([]);
  const [repetidas, setRepetidas] = useState<Figurinha[]>([]);
  const [figurinhasEmTroca, setFigurinhasEmTroca] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProporTrocaModal, setShowProporTrocaModal] = useState(false);
  const [trocaSelecionada, setTrocaSelecionada] = useState<Troca | null>(null);
  const [selectedFigurinha, setSelectedFigurinha] = useState<Figurinha | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('1. Iniciando busca de dados...');
        const [repetidasResponse, trocasResponse] = await Promise.all([
          fetch('/api/repetidas'),
          fetch('/api/trocas')
        ]);

        console.log('2. Status das respostas:', {
          repetidas: repetidasResponse.status,
          trocas: trocasResponse.status
        });

        if (!repetidasResponse.ok || !trocasResponse.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const [repetidasData, trocasData] = await Promise.all([
          repetidasResponse.json(),
          trocasResponse.json()
        ]);

        console.log('3. Dados brutos recebidos:', {
          repetidas: repetidasData,
          trocas: trocasData
        });

        // Extrair IDs das figurinhas em troca
        console.log('4. Extraindo IDs das figurinhas em troca...');
        const figurinhasEmTrocaIds = new Set([
          ...(trocasData.minhasTrocas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
          ...(trocasData.trocasRecebidas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
          ...(trocasData.trocasDisponiveis || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean)
        ]);
        console.log('5. IDs das figurinhas em troca:', Array.from(figurinhasEmTrocaIds));
        setFigurinhasEmTroca(Array.from(figurinhasEmTrocaIds));

        // Formatar e atualizar as trocas
        console.log('6. Formatando trocas...');
        const formatarTroca = (troca: any) => ({
          id: troca.id || '',
          status: troca.status || 'PENDENTE',
          figurinhaOferta: {
            id: troca.figurinhaOferta?.id || '',
            jogador: {
              id: troca.figurinhaOferta?.jogador?.id || '',
              nome: troca.figurinhaOferta?.jogador?.nome || '',
              posicao: troca.figurinhaOferta?.jogador?.posicao || '',
              numero: troca.figurinhaOferta?.jogador?.numero || 0,
              nacionalidade: troca.figurinhaOferta?.jogador?.nacionalidade || '',
              foto: troca.figurinhaOferta?.jogador?.foto || '',
              time: {
                id: troca.figurinhaOferta?.jogador?.time?.id || '',
                nome: troca.figurinhaOferta?.jogador?.time?.nome || '',
                escudo: troca.figurinhaOferta?.jogador?.time?.escudo || ''
              }
            },
            quantidade: troca.figurinhaOferta?.quantidade || 0
          },
          figurinhaSolicitada: troca.figurinhaSolicitada || null,
          usuarioEnvia: {
            id: troca.usuarioEnvia?.id || '',
            nome: troca.usuarioEnvia?.name || '',
          },
          usuarioRecebe: troca.usuarioRecebe || { id: '', nome: '' },
          createdAt: troca.createdAt || ''
        });

        const minhasTrocasFormatadas = trocasData.minhasTrocas.map(formatarTroca);
        const trocasRecebidasFormatadas = trocasData.trocasRecebidas.map(formatarTroca);
        const trocasDisponiveisFormatadas = trocasData.trocasDisponiveis.map(formatarTroca);

        console.log('7. Trocas formatadas:', {
          minhasTrocas: minhasTrocasFormatadas,
          trocasRecebidas: trocasRecebidasFormatadas,
          trocasDisponiveis: trocasDisponiveisFormatadas
        });

        setMinhasTrocas(minhasTrocasFormatadas);
        setPropostasRecebidas(trocasRecebidasFormatadas);
        setTrocasDisponiveis(trocasDisponiveisFormatadas);
        setRepetidas(repetidasData);
        setLoading(false);
        console.log('8. Estado atualizado:', {
          minhasTrocas: minhasTrocasFormatadas.length,
          trocasRecebidas: trocasRecebidasFormatadas.length,
          trocasDisponiveis: trocasDisponiveisFormatadas.length,
          repetidas: repetidasData.length
        });
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTrocas = async () => {
    try {
      const response = await fetch('/api/trocas');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar trocas');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Extrair IDs das figurinhas em troca
      const figurinhasEmTrocaIds = new Set([
        ...(data.minhasTrocas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
        ...(data.trocasRecebidas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
        ...(data.trocasDisponiveis || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean)
      ]);
      setFigurinhasEmTroca(Array.from(figurinhasEmTrocaIds));

      // Formatar e atualizar todas as trocas
      const formatarTroca = (troca: any) => ({
        id: troca.id || '',
        status: troca.status || 'PENDENTE',
        figurinhaOferta: {
          id: troca.figurinhaOferta?.id || '',
          jogador: {
            id: troca.figurinhaOferta?.jogador?.id || '',
            nome: troca.figurinhaOferta?.jogador?.nome || '',
            posicao: troca.figurinhaOferta?.jogador?.posicao || '',
            numero: troca.figurinhaOferta?.jogador?.numero || 0,
            nacionalidade: troca.figurinhaOferta?.jogador?.nacionalidade || '',
            foto: troca.figurinhaOferta?.jogador?.foto || '',
            time: {
              id: troca.figurinhaOferta?.jogador?.time?.id || '',
              nome: troca.figurinhaOferta?.jogador?.time?.nome || '',
              escudo: troca.figurinhaOferta?.jogador?.time?.escudo || ''
            }
          },
          quantidade: troca.figurinhaOferta?.quantidade || 0
        },
        figurinhaSolicitada: troca.figurinhaSolicitada || null,
        usuarioEnvia: {
          id: troca.usuarioEnvia?.id || '',
          nome: troca.usuarioEnvia?.name || '',
        },
        usuarioRecebe: troca.usuarioRecebe || { id: '', nome: '' },
        createdAt: troca.createdAt || ''
      });

      const minhasTrocasFormatadas = (data.minhasTrocas || []).map(formatarTroca);
      const trocasRecebidasFormatadas = (data.trocasRecebidas || []).map(formatarTroca);
      const trocasDisponiveisFormatadas = (data.trocasDisponiveis || []).map(formatarTroca);

      setMinhasTrocas(minhasTrocasFormatadas);
      setPropostasRecebidas(trocasRecebidasFormatadas);
      setTrocasDisponiveis(trocasDisponiveisFormatadas);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar trocas');
      setLoading(false);
    }
  };

  const adicionarTroca = async (figurinha: Figurinha) => {
    try {
      const response = await fetch('/api/trocas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          figurinhaId: figurinha.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar troca');
      }

      // Recarrega as trocas e as repetidas
      const [repetidasResponse] = await Promise.all([
        fetch('/api/repetidas'),
        fetchTrocas()
      ]);

      if (!repetidasResponse.ok) {
        throw new Error('Erro ao atualizar repetidas');
      }

      const repetidasData = await repetidasResponse.json();
      setRepetidas(repetidasData);
      setFigurinhasEmTroca([...figurinhasEmTroca, figurinha.id]);
    } catch (error) {
      console.error('Erro ao adicionar troca:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao adicionar troca');
      setShowErrorModal(true);
    }
  };

  const handleProporTroca = async (figurinha: Figurinha) => {
    if (!trocaSelecionada) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/trocas/propor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trocaId: trocaSelecionada.id,
          figurinhaId: figurinha.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao propor troca');
      }

      const data = await response.json();
      setTrocasDisponiveis(trocasDisponiveis.filter(t => t.id !== trocaSelecionada.id));
      setTrocaSelecionada(null);
      setFigurinhasEmTroca([...figurinhasEmTroca, figurinha.id]);
      
      // Recarregar as trocas
      await fetchTrocas();
    } catch (error) {
      console.error('Erro ao propor troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao propor troca');
    } finally {
      setLoading(false);
    }
  };

  const handleResponderTroca = async (trocaId: string, aceitar: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/trocas/${trocaId}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aceitar }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao responder troca');
      }

      // Atualizar a lista de propostas recebidas
      setPropostasRecebidas(propostasRecebidas.filter(t => t.id !== trocaId));
      
      // Atualizar o estado figurinhasEmTroca
      const troca = propostasRecebidas.find(t => t.id === trocaId);
      if (troca) {
        setFigurinhasEmTroca(figurinhasEmTroca.filter(id => id !== troca.figurinhaOferta.id));
      }
      
      // Recarregar as trocas
      await fetchTrocas();
      
      setError(null);
    } catch (error) {
      console.error('Erro ao responder troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao responder troca');
    } finally {
      setLoading(false);
    }
  };

  const removerTroca = async (figurinha: Figurinha) => {
    try {
      const response = await fetch('/api/trocas/remover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ figurinhaId: figurinha.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao remover troca');
      }

      // Recarrega as trocas e as repetidas
      const [repetidasResponse] = await Promise.all([
        fetch('/api/repetidas'),
        fetchTrocas()
      ]);

      if (!repetidasResponse.ok) {
        throw new Error('Erro ao atualizar repetidas');
      }

      const repetidasData = await repetidasResponse.json();
      setRepetidas(repetidasData);
      setFigurinhasEmTroca(figurinhasEmTroca.filter(id => id !== figurinha.id));
    } catch (error) {
      console.error('Erro ao remover troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao remover troca');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen  text-white p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Área de Trocas</h1>
        <p>Por favor, faça login para acessar a área de trocas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Carregando...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Erro</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-brasil-blue">Trocas</h1>

        {/* Minhas Figurinhas Repetidas */}
        <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
          <h2 className="text-xl font-bold mb-6 text-brasil-blue flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Minhas Figurinhas Repetidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {repetidas.map((figurinha) => (
              <div key={figurinha.id} className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-brasil-green/10 to-brasil-yellow/10 rounded-lg overflow-hidden border-2 border-brasil-yellow/20">
                  <Image
                    src={formatarCaminhoImagem(figurinha.jogador.time.nome, figurinha.jogador.nome)[0]}
                    alt={figurinha.jogador.nome}
                    fill
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                    className="object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const caminhos = formatarCaminhoImagem(figurinha.jogador.time.nome, figurinha.jogador.nome);
                      if (img.src.includes(caminhos[0])) {
                        img.src = caminhos[1];
                      } else {
                        img.src = '/public/placeholder.jpg';
                      }
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  {figurinha.jogador.time.escudo && (
                    <Image
                      src={figurinha.jogador.time.escudo}
                      alt={figurinha.jogador.time.nome}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  )}
                  <span className="text-sm text-gray-600">{figurinha.jogador.time.nome}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{figurinha.jogador.nome}</span>
                  <span className="text-sm font-semibold text-brasil-blue">x{figurinha.quantidade}</span>
                </div>
                <div className="mt-3">
                  {figurinhasEmTroca.includes(figurinha.id) ? (
                    <button
                      onClick={() => removerTroca(figurinha)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remover
                    </button>
                  ) : (
                    <button
                      onClick={() => adicionarTroca(figurinha)}
                      className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow py-1.5 px-2 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Disponibilizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minhas Trocas */}
        <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
          <h2 className="text-xl font-bold mb-6 text-brasil-blue flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Minhas Trocas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {minhasTrocas.map((troca) => (
              <div key={troca.id} className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-brasil-green/10 to-brasil-yellow/10 rounded-lg overflow-hidden border-2 border-brasil-yellow/20">
                  <Image
                    src={formatarCaminhoImagem(troca.figurinhaOferta.jogador.time.nome, troca.figurinhaOferta.jogador.nome)[0]}
                    alt={troca.figurinhaOferta.jogador.nome}
                    fill
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                    className="object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const caminhos = formatarCaminhoImagem(troca.figurinhaOferta.jogador.time.nome, troca.figurinhaOferta.jogador.nome);
                      if (img.src.includes(caminhos[0])) {
                        img.src = caminhos[1];
                      } else {
                        img.src = '/public/placeholder.jpg';
                      }
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  {troca.figurinhaOferta.jogador.time.escudo && (
                    <Image
                      src={troca.figurinhaOferta.jogador.time.escudo}
                      alt={troca.figurinhaOferta.jogador.time.nome}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  )}
                  <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.time.nome}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.nome}</span>
                  <span className="text-sm font-semibold text-brasil-blue">x{troca.figurinhaOferta.quantidade}</span>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => removerTroca(troca.figurinhaOferta)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trocas Disponíveis */}
        <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
          <h2 className="text-xl font-bold mb-6 text-brasil-blue flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Trocas Disponíveis
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trocasDisponiveis.map((troca) => (
              <div key={troca.id} className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-brasil-green/10 to-brasil-yellow/10 rounded-lg overflow-hidden border-2 border-brasil-yellow/20">
                  <Image
                    src={formatarCaminhoImagem(troca.figurinhaOferta.jogador.time.nome, troca.figurinhaOferta.jogador.nome)[0]}
                    alt={troca.figurinhaOferta.jogador.nome}
                    fill
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                    className="object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const caminhos = formatarCaminhoImagem(troca.figurinhaOferta.jogador.time.nome, troca.figurinhaOferta.jogador.nome);
                      if (img.src.includes(caminhos[0])) {
                        img.src = caminhos[1];
                      } else {
                        img.src = '/public/placeholder.jpg';
                      }
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  {troca.figurinhaOferta.jogador.time.escudo && (
                    <Image
                      src={troca.figurinhaOferta.jogador.time.escudo}
                      alt={troca.figurinhaOferta.jogador.time.nome}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  )}
                  <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.time.nome}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.nome}</span>
                  <span className="text-sm font-semibold text-brasil-blue">x{troca.figurinhaOferta.quantidade}</span>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setTrocaSelecionada(troca);
                      setShowProporTrocaModal(true);
                    }}
                    className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow py-1.5 px-2 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Propor Troca
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Propostas Recebidas */}
        <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
          <h2 className="text-xl font-bold mb-6 text-brasil-blue flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Propostas Recebidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {propostasRecebidas.map((troca) => (
              <div key={troca.id} className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-brasil-green/10 to-brasil-yellow/10 rounded-lg overflow-hidden border-2 border-brasil-yellow/20">
                  <Image
                    src={formatarCaminhoImagem(troca.figurinhaOferta.jogador.time.nome, troca.figurinhaOferta.jogador.nome)[0]}
                    alt={troca.figurinhaOferta.jogador.nome}
                    fill
                    sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                    className="object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const caminhos = formatarCaminhoImagem(troca.figurinhaOferta.jogador.time.nome, troca.figurinhaOferta.jogador.nome);
                      if (img.src.includes(caminhos[0])) {
                        img.src = caminhos[1];
                      } else {
                        img.src = '/public/placeholder.jpg';
                      }
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  {troca.figurinhaOferta.jogador.time.escudo && (
                    <Image
                      src={troca.figurinhaOferta.jogador.time.escudo}
                      alt={troca.figurinhaOferta.jogador.time.nome}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  )}
                  <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.time.nome}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.nome}</span>
                  <span className="text-sm font-semibold text-brasil-blue">x{troca.figurinhaOferta.quantidade}</span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleResponderTroca(troca.id, true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 px-2 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Aceitar
                  </button>
                  <button
                    onClick={() => handleResponderTroca(troca.id, false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modais */}
        {showProporTrocaModal && trocaSelecionada && (
          <ModalProporTroca
            isOpen={showProporTrocaModal}
            onClose={() => {
              setShowProporTrocaModal(false);
              setTrocaSelecionada(null);
            }}
            troca={trocaSelecionada}
            onProporTroca={handleProporTroca}
            figurinhasRepetidas={repetidas}
          />
        )}

        {showErrorModal && (
          <Modal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            title="Erro"
          >
            <p className="text-red-500">{errorMessage}</p>
          </Modal>
        )}
      </div>
    </div>
  );
} 