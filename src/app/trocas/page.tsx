'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/Modal';

interface Figurinha {
  id: string;
  jogador: {
    id: string;
    nome: string;
    posicao: string;
    numero: number;
    nacionalidade: string;
    time: {
      id: string;
      nome: string;
      escudo: string;
    };
  };
  quantidade: number;
  raridade: string;
}

interface Troca {
  id: string;
  figurinhaOferta: {
    id: string;
    jogador: {
      nome: string;
      posicao: string;
      numero: number;
      time: {
        id: string;
        nome: string;
        escudo: string;
      };
    };
  };
  usuarioEnvia: {
    name: string;
    email: string;
  };
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO';
  figurinhaSolicitada?: {
    id: string;
    jogador: {
      nome: string;
      posicao: string;
      numero: number;
      time: {
        id: string;
        nome: string;
        escudo: string;
      };
    };
  };
}

export default function Trocas() {
  const { data: session } = useSession();
  const [minhasTrocas, setMinhasTrocas] = useState<Troca[]>([]);
  const [trocasDisponiveis, setTrocasDisponiveis] = useState<Troca[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [figurinhasRepetidas, setFigurinhasRepetidas] = useState<Figurinha[]>([]);
  const [figurinhasDisponiveisParaTroca, setFigurinhasDisponiveisParaTroca] = useState<Figurinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showProporTrocaModal, setShowProporTrocaModal] = useState(false);
  const [trocaSelecionada, setTrocaSelecionada] = useState<Troca | null>(null);

  useEffect(() => {
    if (session) {
      fetchTrocas();
      fetchFigurinhasRepetidas();
    }
  }, [session]);

  useEffect(() => {
    // Filtrar figurinhas que não estão listadas para troca
    const figurinhasEmTrocas = new Set(minhasTrocas.map(troca => troca.figurinhaOferta.id));
    const figurinhasDisponiveis = figurinhasRepetidas.filter(figurinha => !figurinhasEmTrocas.has(figurinha.id));
    setFigurinhasDisponiveisParaTroca(figurinhasDisponiveis);
  }, [figurinhasRepetidas, minhasTrocas]);

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

      // Adicionar verificações e valores padrão
      const trocasFormatadas: Troca[] = (data.trocasDisponiveis || []).map((troca: any) => ({
        id: troca.id || '',
        status: troca.status || 'PENDENTE',
        figurinhaOferta: {
          id: troca.figurinha?.id || '',
          jogador: {
            id: troca.figurinha?.jogador?.id || '',
            nome: troca.figurinha?.jogador?.nome || '',
            posicao: troca.figurinha?.jogador?.posicao || '',
            numero: troca.figurinha?.jogador?.numero || 0,
            time: {
              id: troca.figurinha?.jogador?.time?.id || '',
              nome: troca.figurinha?.jogador?.time?.nome || '',
              escudo: troca.figurinha?.jogador?.time?.escudo || ''
            }
          }
        },
        usuarioEnvia: {
          id: troca.usuarioEnvia?.id || '',
          name: troca.usuarioEnvia?.name || '',
          email: troca.usuarioEnvia?.email || ''
        }
      }));

      const minhasTrocas = (data.minhasTrocas || []).map((troca: any) => ({
        id: troca.id || '',
        status: troca.status || 'PENDENTE',
        figurinhaOferta: {
          id: troca.figurinha?.id || '',
          jogador: {
            id: troca.figurinha?.jogador?.id || '',
            nome: troca.figurinha?.jogador?.nome || '',
            posicao: troca.figurinha?.jogador?.posicao || '',
            numero: troca.figurinha?.jogador?.numero || 0,
            time: {
              id: troca.figurinha?.jogador?.time?.id || '',
              nome: troca.figurinha?.jogador?.time?.nome || '',
              escudo: troca.figurinha?.jogador?.time?.escudo || ''
            }
          }
        },
        usuarioEnvia: {
          id: troca.usuarioEnvia?.id || '',
          name: troca.usuarioEnvia?.name || '',
          email: troca.usuarioEnvia?.email || ''
        }
      }));

      setMinhasTrocas(minhasTrocas);
      setTrocasDisponiveis(trocasFormatadas);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar trocas');
      setLoading(false);
    }
  };

  const fetchFigurinhasRepetidas = async () => {
    try {
      const response = await fetch('/api/repetidas');
      if (!response.ok) {
        throw new Error('Erro ao buscar figurinhas repetidas');
      }
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Dados inválidos recebidos da API:', data);
        setFigurinhasRepetidas([]);
        return;
      }

      setFigurinhasRepetidas(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar figurinhas repetidas:', error);
      setError('Erro ao carregar figurinhas repetidas');
      setFigurinhasRepetidas([]);
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
        body: JSON.stringify({ figurinhaId: figurinha.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar troca');
      }

      await fetchTrocas(); // Recarrega as trocas após adicionar uma nova
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao adicionar troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao adicionar troca');
    }
  };

  const handleProporTroca = async (figurinha: Figurinha) => {
    try {
      if (!trocaSelecionada) return;

      console.log('Iniciando handleProporTroca com figurinha:', figurinha);
      setLoading(true);
      setError(null);

      const response = await fetch('/api/trocas/propor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trocaId: trocaSelecionada.id,
          figurinhaId: figurinha.id
        }),
      });

      console.log('Resposta da API:', response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao propor troca');
      }

      const data = await response.json();
      console.log('Dados da resposta:', data);

      // Atualizar a lista de trocas disponíveis
      setTrocasDisponiveis(trocasDisponiveis.filter(t => t.id !== trocaSelecionada.id));
      setSuccessMessage('Troca proposta com sucesso!');
      setShowSuccessModal(true);
      setShowProporTrocaModal(false);
      setTrocaSelecionada(null);
    } catch (error) {
      console.error('Erro ao propor troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao propor troca');
    } finally {
      setLoading(false);
    }
  };

  const handleResponderTroca = async (trocaId: string, aceitar: boolean) => {
    try {
      const response = await fetch(`/api/trocas/${trocaId}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aceitar }),
      });

      if (!response.ok) {
        throw new Error('Erro ao responder à troca');
      }

      // Recarregar as trocas após a resposta
      fetchTrocas();
    } catch (error) {
      console.error('Erro ao responder à troca:', error);
      setError('Erro ao responder à troca');
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
      <div className="min-h-screen  text-white p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Área de Trocas</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Área de Trocas</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Trocas</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trocasDisponiveis.map((troca) => (
            <div
              key={troca.id}
              className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <img
                    src="/default-avatar.png"
                    alt={troca.usuarioEnvia.name}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                  />
                  <span className="text-sm md:text-base font-medium text-brasil-blue">
                    {troca.usuarioEnvia.name}
                  </span>
                </div>
                <span className={`text-xs md:text-sm px-2 py-1 rounded-full ${
                  troca.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                  troca.status === 'ACEITO' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {troca.status}
                </span>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <h3 className="text-sm md:text-base font-semibold text-brasil-blue mb-2">Oferece:</h3>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    {troca.figurinhaOferta.jogador.time.escudo && (
                      <img
                        src={troca.figurinhaOferta.jogador.time.escudo}
                        alt={troca.figurinhaOferta.jogador.time.nome}
                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                      />
                    )}
                    <div>
                      <p className="text-sm md:text-base font-medium">{troca.figurinhaOferta.jogador.nome}</p>
                      <p className="text-xs md:text-sm text-gray-600">
                        #{troca.figurinhaOferta.jogador.numero} - {troca.figurinhaOferta.jogador.posicao}
                      </p>
                    </div>
                  </div>
                </div>

                {troca.figurinhaSolicitada && (
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-sm md:text-base font-semibold text-brasil-blue mb-2">Solicita:</h3>
                    <div className="flex items-center space-x-2 md:space-x-3">
                      {troca.figurinhaSolicitada.jogador.time.escudo && (
                        <img
                          src={troca.figurinhaSolicitada.jogador.time.escudo}
                          alt={troca.figurinhaSolicitada.jogador.time.nome}
                          className="w-6 h-6 md:w-8 md:h-8 object-contain"
                        />
                      )}
                      <div>
                        <p className="text-sm md:text-base font-medium">{troca.figurinhaSolicitada.jogador.nome}</p>
                        <p className="text-xs md:text-sm text-gray-600">
                          #{troca.figurinhaSolicitada.jogador.numero} - {troca.figurinhaSolicitada.jogador.posicao}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {troca.status === 'PENDENTE' && (
                  <div className="flex space-x-2 md:space-x-3">
                    <button
                      onClick={() => handleResponderTroca(troca.id, true)}
                      className="flex-1 bg-brasil-green hover:bg-brasil-green/90 text-white text-sm md:text-base font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleResponderTroca(troca.id, false)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm md:text-base font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para adicionar figurinha para troca */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-semibold mb-4 text-brasil-blue">Adicionar figurinha para troca</h2>
        {figurinhasDisponiveisParaTroca.length === 0 ? (
          <p className="text-gray-600">Você não tem figurinhas disponíveis para troca.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {figurinhasDisponiveisParaTroca.map((figurinha) => (
              <div
                key={figurinha.id}
                className="bg-white/50 p-4 rounded-lg border border-brasil-yellow/20 cursor-pointer hover:bg-white/70 transition-colors"
                onClick={() => adicionarTroca(figurinha)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 relative flex items-center justify-center bg-gray-100 rounded-full">
                    {figurinha.jogador?.time?.escudo ? (
                      <Image
                        src={figurinha.jogador.time.escudo}
                        alt={figurinha.jogador.time.nome}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">{figurinha.jogador?.time?.nome?.substring(0, 3) || 'Time'}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-brasil-blue">{figurinha.jogador.nome}</p>
                    <p className="text-sm text-gray-600">
                      {figurinha.jogador.posicao} - #{figurinha.jogador.numero}
                    </p>
                    <p className="text-sm text-gray-600">Time: {figurinha.jogador.time.nome}</p>
                    <p className="text-sm text-gray-600">Quantidade: {figurinha.quantidade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal de propor troca */}
      <Modal isOpen={showProporTrocaModal} onClose={() => {
        setShowProporTrocaModal(false);
        setTrocaSelecionada(null);
      }}>
        <h2 className="text-2xl font-bold mb-4">Escolha uma figurinha para propor troca</h2>
        <div className="grid grid-cols-2 gap-4">
          {figurinhasRepetidas.map((figurinha) => (
            <div
              key={figurinha.id}
              className="bg-purple-700 p-4 rounded-lg cursor-pointer hover:bg-purple-600"
              onClick={() => handleProporTroca(figurinha)}
            >
              <h3 className="font-bold">{figurinha.jogador.nome}</h3>
              <p className="text-sm">{figurinha.jogador.posicao}</p>
              <p className="text-xs">#{figurinha.jogador.numero}</p>
              <p className="text-xs mt-1">Repetidas: {figurinha.quantidade}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal de sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-black">{successMessage}</h2>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 