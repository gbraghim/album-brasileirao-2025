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
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Trocas</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {repetidas.map((figurinha) => (
            <div key={figurinha.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-3">
              <div className="relative w-full aspect-[3/4] mb-2">
                <Image
                  src={formatarCaminhoImagem(figurinha.jogador.time.nome, figurinha.jogador.nome)}
                  alt={figurinha.jogador.nome}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Image
                  src={figurinha.jogador.time.escudo}
                  alt={figurinha.jogador.time.nome}
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span className="text-sm text-gray-600">{figurinha.jogador.time.nome}</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600">{figurinha.jogador.nome}</span>
                <span className="text-sm font-semibold text-brasil-blue">x{figurinha.quantidade}</span>
              </div>
              <div className="mt-2">
                {figurinhasEmTroca.includes(figurinha.id) ? (
                  <button
                    onClick={() => removerTroca(figurinha)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm"
                  >
                    Remover da Troca
                  </button>
                ) : (
                  <button
                    onClick={() => handleProporTroca(figurinha)}
                    className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow py-1 px-2 rounded text-sm"
                  >
                    Propor Troca
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 