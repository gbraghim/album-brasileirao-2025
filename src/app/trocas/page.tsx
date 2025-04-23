'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/Modal';
import ModalProporTroca from '@/components/ModalProporTroca';

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
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Área de Trocas</h1>

        {/* Seção de Minhas Figurinhas Repetidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-brasil-blue mb-4">Minhas Figurinhas Repetidas</h2>
          {repetidas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repetidas.map((figurinha) => (
                <div key={figurinha.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl font-bold text-brasil-blue">{figurinha.jogador.numero}</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-brasil-blue">{figurinha.jogador.nome}</h3>
                      <p className="text-sm text-gray-600">{figurinha.jogador.posicao}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Quantidade: {figurinha.quantidade - 1}</p>
                    <p className="text-sm text-gray-600">Time: {figurinha.jogador.time.nome}</p>
                  </div>
                  {figurinhasEmTroca.includes(figurinha.id) ? (
                    <div className="flex flex-col gap-2">
                      <button
                        className="w-full px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                        disabled
                      >
                        Figurinha já disponibilizada para troca
                      </button>
            <button
                        onClick={() => removerTroca(figurinha)}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                        Remover da troca
            </button>
          </div>
                  ) : (
                    <button
                      onClick={() => adicionarTroca(figurinha)}
                      className="bg-brasil-yellow hover:bg-brasil-yellow-dark text-brasil-blue font-bold py-2 px-4 rounded"
                      disabled={loading || figurinhasEmTroca.includes(figurinha.id)}
                    >
                      {figurinhasEmTroca.includes(figurinha.id)
                        ? 'Em Troca'
                        : 'Disponibilizar para Troca'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Você não tem figurinhas repetidas no momento.</p>
          )}
        </div>

        {/* Seção de Propostas Recebidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-brasil-blue mb-4">Propostas Recebidas</h2>
          {propostasRecebidas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {propostasRecebidas.map((troca) => (
                <div key={troca.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl font-bold text-brasil-blue">{troca.figurinhaOferta.jogador.numero}</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-brasil-blue">{troca.figurinhaOferta.jogador.nome}</h3>
                      <p className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.posicao}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Proposta por: {troca.usuarioEnvia.nome}</p>
                  </div>
                  {troca.figurinhaSolicitada && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold">Solicitou sua figurinha:</p>
                      <div className="flex items-center mt-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-bold">{troca.figurinhaSolicitada.jogador.numero}</span>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm">{troca.figurinhaSolicitada.jogador.nome}</p>
                          <p className="text-xs text-gray-600">{troca.figurinhaSolicitada.jogador.posicao}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleResponderTroca(troca.id, false)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Recusar
                    </button>
                    <button
                      onClick={() => handleResponderTroca(troca.id, true)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Aceitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma proposta de troca recebida.</p>
          )}
        </div>

        {/* Seção de Trocas Disponíveis */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-brasil-blue mb-4">Trocas Disponíveis</h2>
          {trocasDisponiveis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trocasDisponiveis.map((troca) => (
                <div key={troca.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl font-bold text-brasil-blue">{troca.figurinhaOferta.jogador.numero}</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-brasil-blue">{troca.figurinhaOferta.jogador.nome}</h3>
                      <p className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.posicao}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Oferecido por: {troca.usuarioEnvia.nome}</p>
                    </div>
                    <button
                      onClick={() => {
                        setTrocaSelecionada(troca);
                        setShowProporTrocaModal(true);
                      }}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                    Propor Troca
                    </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma troca disponível no momento.</p>
          )}
        </div>

        {/* Seção de Minhas Trocas */}
        <div>
          <h2 className="text-2xl font-semibold text-brasil-blue mb-4">Minhas Trocas</h2>
          {minhasTrocas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {minhasTrocas.map((troca) => (
                <div key={troca.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl font-bold text-brasil-blue">{troca.figurinhaOferta.jogador.numero}</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-brasil-blue">{troca.figurinhaOferta.jogador.nome}</h3>
                      <p className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.posicao}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Status: {troca.status === 'PENDENTE' ? 'sem propostas recebidas' : troca.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Você não tem nenhuma troca ativa.</p>
          )}
      </div>

        {/* Modais */}
        <Modal
          isOpen={showProporTrocaModal}
          onClose={() => setShowProporTrocaModal(false)}
          title="Propor Troca"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repetidas.map((figurinha) => (
              <div
                key={figurinha.id}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedFigurinha(figurinha);
                  setTrocaSelecionada(null);
                  setShowProporTrocaModal(true);
                }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-bold text-brasil-blue">{figurinha.jogador.numero}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-brasil-blue">{figurinha.jogador.nome}</h3>
                    <p className="text-sm text-gray-600">{figurinha.jogador.posicao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal>

        <ModalProporTroca
          isOpen={showProporTrocaModal}
          onClose={() => setShowProporTrocaModal(false)}
          troca={trocaSelecionada}
          onProporTroca={handleProporTroca}
          figurinhasRepetidas={repetidas}
        />

        {showErrorModal && (
          <Modal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            title="Erro"
          >
            <div className="p-6">
              <p className="text-red-500">{errorMessage}</p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
} 