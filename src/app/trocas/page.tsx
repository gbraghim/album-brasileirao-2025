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
  const [repetidas, setRepetidas] = useState<Figurinha[]>([]);
  const [figurinhasEmTroca, setFigurinhasEmTroca] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showProporTrocaModal, setShowProporTrocaModal] = useState(false);
  const [trocaSelecionada, setTrocaSelecionada] = useState<Troca | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repetidasResponse, trocasResponse] = await Promise.all([
          fetch('/api/repetidas'),
          fetch('/api/trocas')
        ]);

        if (!repetidasResponse.ok || !trocasResponse.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const [repetidasData, trocasData] = await Promise.all([
          repetidasResponse.json(),
          trocasResponse.json()
        ]);

        // Extrair IDs das figurinhas em troca
        const figurinhasEmTrocaIds = Array.isArray(trocasData.minhasTrocas) 
          ? trocasData.minhasTrocas
              .map((t: any) => t.figurinha?.id)
              .filter(Boolean)
          : [];
        setFigurinhasEmTroca(figurinhasEmTrocaIds);

        setRepetidas(repetidasData);
        setLoading(false);
      } catch (err) {
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

      console.log('Dados recebidos da API:', data);

      // Adicionar verificações e valores padrão
      const trocasFormatadas: Troca[] = (data.trocasDisponiveis || []).map((troca: any) => ({
        id: troca.id || '',
        status: troca.status || 'PENDENTE',
        figurinhaOferta: {
          id: troca.figurinha?.id || '',
          jogador: {
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
          name: troca.usuarioEnvia?.name || '',
          email: troca.usuarioEnvia?.email || ''
        }
      }));

      const minhasTrocasFormatadas = (data.minhasTrocas || []).map((troca: any) => ({
        id: troca.id || '',
        status: troca.status || 'PENDENTE',
        figurinhaOferta: {
          id: troca.figurinha?.id || '',
          jogador: {
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
          name: troca.usuarioEnvia?.name || '',
          email: troca.usuarioEnvia?.email || ''
        }
      }));

      console.log('Trocas formatadas:', trocasFormatadas);
      console.log('Minhas trocas formatadas:', minhasTrocasFormatadas);

      setMinhasTrocas(minhasTrocasFormatadas);
      setTrocasDisponiveis(trocasFormatadas);
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

        {/* Seção de Figurinhas Disponíveis para Troca */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-brasil-blue">Minhas Figurinhas para Troca</h2>
          {repetidas.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center">
              <p className="text-gray-600 mb-4">Você ainda não tem figurinhas repetidas disponíveis para troca.</p>
              <p className="text-gray-600">Abra mais pacotes para conseguir figurinhas repetidas!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {repetidas.map((figurinha) => (
                <div key={figurinha.id} className="bg-gradient-to-br from-white via-blue-100 to-blue-500 rounded-lg shadow-md p-3 md:p-4 flex flex-col">
                  <div className="flex items-center mb-3 md:mb-4">
                    {figurinha.jogador.time.escudo && (
                      <img
                        src={figurinha.jogador.time.escudo}
                        alt={figurinha.jogador.time.nome}
                        className="w-10 h-10 md:w-12 md:h-12 object-contain mr-3 md:mr-4"
                      />
                    )}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">{figurinha.jogador.nome}</h3>
                      <p className="text-sm md:text-base text-gray-600">{figurinha.jogador.time.nome}</p>
                    </div>
                  </div>
                  <div className="flex-grow">
                    {figurinha.jogador.time.escudo && (
                      <img
                        src={figurinha.jogador.time.escudo}
                        alt={figurinha.jogador.nome}
                        className="w-full h-32 md:h-48 object-cover rounded-lg mb-3 md:mb-4"
                      />
                    )}
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-sm md:text-base text-gray-800"><span className="font-semibold">Time:</span> {figurinha.jogador.time.nome}</p>
                      <p className="text-sm md:text-base text-gray-800"><span className="font-semibold">Nacionalidade:</span> {figurinha.jogador.nacionalidade}</p>
                      <p className="text-sm md:text-base text-gray-800">
                        <span className="font-semibold">Repetidas:</span> {figurinha.quantidade}
                      </p>
                    </div>
                  </div>
                  {figurinhasEmTroca.includes(figurinha.id) ? (
                    <div className="mt-4">
                      <button
                        className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Figurinha já disponibilizada para troca
                      </button>
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        Esta figurinha já está em uma troca pendente
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => adicionarTroca(figurinha)}
                      className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Iniciar Troca
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de Trocas Disponíveis */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-brasil-blue">Trocas Disponíveis</h2>
          {trocasDisponiveis.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center">
              <p className="text-gray-600 mb-4">Não há trocas disponíveis no momento.</p>
              <p className="text-gray-600">Seja o primeiro a propor uma troca!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trocasDisponiveis.map((troca) => (
                <div
                  key={troca.id}
                  className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-brasil-yellow/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/default-avatar.png"
                        alt={troca.usuarioEnvia.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium text-brasil-blue">
                        {troca.usuarioEnvia.name}
                      </span>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      troca.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                      troca.status === 'ACEITO' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {troca.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-semibold text-brasil-blue mb-2">Oferece:</h3>
                    <div className="flex items-center space-x-2">
                      {troca.figurinhaOferta.jogador.time.escudo && (
                        <img
                          src={troca.figurinhaOferta.jogador.time.escudo}
                          alt={troca.figurinhaOferta.jogador.time.nome}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <div>
                        <p className="font-medium">{troca.figurinhaOferta.jogador.nome}</p>
                        <p className="text-sm text-gray-600">
                          #{troca.figurinhaOferta.jogador.numero} - {troca.figurinhaOferta.jogador.posicao}
                        </p>
                      </div>
                    </div>
                  </div>

                  {troca.status === 'PENDENTE' && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => {
                          setTrocaSelecionada(troca);
                          setShowProporTrocaModal(true);
                        }}
                        className="flex-1 bg-brasil-green hover:bg-brasil-green/90 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Propor Troca
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 