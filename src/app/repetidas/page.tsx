'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { formatarCaminhoImagem, getS3EscudoUrl } from '@/lib/utils';
import Link from 'next/link';

interface Figurinha {
  id: string;
  jogador: {
    id: string;
    nome: string;
    nacionalidade: string;
    numero: number;
    posicao: string;
    time: {
      nome: string;
      escudo: string;
    };
  };
  quantidade: number;
  raridade: string;
}

// Função utilitária para normalizar strings (remover acentos e deixar minúsculo)
function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Função para definir a cor da borda de acordo com a raridade
function getRaridadeStyle(raridade: string) {
  switch (raridade) {
    case 'Lendário':
      return 'border-purple-600 shadow-purple-600 bg-gradient-to-br from-purple-600/20 to-purple-900/20';
    case 'Ouro':
      return 'border-yellow-500 shadow-yellow-500 bg-gradient-to-br from-yellow-500/20 to-yellow-700/20';
    case 'Prata':
      return 'border-gray-400 shadow-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-600/20';
    default:
      return 'border-gray-400 shadow-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-600/20';
  }
}

export default function Repetidas() {
  const { data: session } = useSession();
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFigurinha, setSelectedFigurinha] = useState<Figurinha | null>(null);
  const [figurinhasEmTroca, setFigurinhasEmTroca] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingFigurinha, setLoadingFigurinha] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

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

      setFigurinhas(repetidasData);
      setLoading(false);
      console.log('6. Estado atualizado:', {
        repetidas: repetidasData.length,
        figurinhasEmTroca: Array.from(figurinhasEmTrocaIds).length
      });
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  const enviarParaTroca = async (figurinha: Figurinha) => {
    try {
      const response = await fetch('/api/trocas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ figurinhaId: figurinha.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || 'Erro ao disponibilizar figurinha para troca');
        setShowErrorModal(true);
        return;
      }

      setSelectedFigurinha(figurinha);
      setShowSuccessModal(true);
      fetchData(); // Recarrega a lista de figurinhas
    } catch (error) {
      console.error('Erro ao enviar figurinha para troca:', error);
      setErrorMessage('Erro ao enviar figurinha para troca');
      setShowErrorModal(true);
    }
  };

  const removerTroca = async (figurinha: Figurinha) => {
    setLoadingFigurinha(figurinha.id);
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

      // Atualizar o estado local
      setFigurinhasEmTroca(figurinhasEmTroca.filter(id => id !== figurinha.id));
      setShowErrorModal(false);
    } catch (error) {
      console.error('Erro ao remover troca:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao remover troca');
      setShowErrorModal(true);
    } finally {
      setLoadingFigurinha(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Minhas Figurinhas Repetidas</h1>
        <p>Por favor, faça login para acessar suas figurinhas repetidas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen  text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchData();
          }}
          className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!loading && !error && figurinhas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
        <main>
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Minhas Figurinhas Repetidas</h1>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Você ainda não tem figurinhas repetidas.</p>
            <Link href="/pacotes" className="inline-block mt-2 px-6 py-3 bg-brasil-blue text-white rounded-lg font-semibold shadow hover:bg-brasil-blue/90 transition-colors">
              Abra mais pacotes para conseguir figurinhas repetidas!
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
      <main>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Minhas Figurinhas Repetidas</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
          {figurinhas.map((figurinha) => (
            <div key={figurinha.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-0 flex flex-col items-center min-w-0 w-32 mx-auto">
              <div className={`relative w-28 h-40 rounded-lg border-4 ${getRaridadeStyle(figurinha.raridade)} shadow-lg overflow-hidden mt-2`}>
                <Image
                  src={formatarCaminhoImagem(figurinha.jogador.time.nome, figurinha.jogador.nome)[0]}
                  alt={figurinha.jogador.nome}
                  fill
                  sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 160px"
                  className="object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = '/public/placeholder.jpg';
                  }}
                />
                {/* Tag de raridade */}
                {figurinha.raridade && (
                  <div className="absolute top-1 right-1">
                    <div className={`px-1 py-0.5 rounded text-[10px] font-medium ${
                      figurinha.raridade === 'Lendário' ? 'bg-purple-600/80 text-white' :
                      figurinha.raridade === 'Ouro' ? 'bg-yellow-500/80 text-black' :
                      'bg-gray-400/80 text-black'
                    }`}>
                      {figurinha.raridade}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-center mt-3 w-full px-2">
                {figurinha.jogador.time.escudo && (
                  <Image
                    src={getS3EscudoUrl(figurinha.jogador.time.escudo)}
                    alt={figurinha.jogador.time.nome}
                    width={18}
                    height={18}
                    className="w-4 h-4"
                  />
                )}
                <span className="text-xs text-gray-600 truncate text-center w-full">{figurinha.jogador.time.nome}</span>
              </div>
              <div className="mt-0.5 flex flex-col items-center w-full px-2">
                <span className="text-xs text-gray-600 truncate max-w-[110px] text-center w-full">{figurinha.jogador.nome}</span>
                <span className="text-xs font-semibold text-brasil-blue">x{figurinha.quantidade}</span>
              </div>
              <div className="flex justify-between items-center mt-0.5 w-full px-2">
                {!figurinhasEmTroca.includes(figurinha.id) && normalize(figurinha.raridade) !== 'lendario' && (
                  <button
                    onClick={() => enviarParaTroca(figurinha)}
                    className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow py-1 px-1 rounded text-xs h-9 min-h-0 transition-colors duration-300 flex items-center justify-center gap-1"
                  >

                   Disponibilizar para troca
                  </button>
                )}
                {figurinhasEmTroca.includes(figurinha.id) && (
                  <button
                    onClick={() => removerTroca(figurinha)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-1 rounded text-xs h-7 min-h-0 transition-colors duration-300 flex items-center justify-center gap-1"
                    disabled={loadingFigurinha === figurinha.id}
                  >
                    {loadingFigurinha === figurinha.id ? (
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    ) : null}
                    Remover
                  </button>
                )}
                {normalize(figurinha.raridade) === 'lendario' && (
                  <span className="text-xs text-gray-500 text-center italic">Figurinha lendária não pode ser trocada</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modais */}
      {showSuccessModal && selectedFigurinha && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Sucesso!"
        >
          <div className="p-6">
            <p className="text-green-600">
              Figurinha {selectedFigurinha.jogador.nome} disponibilizada para troca com sucesso!
            </p>
          </div>
        </Modal>
      )}

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
  );
} 