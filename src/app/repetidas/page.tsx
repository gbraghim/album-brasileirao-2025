'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';
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
      setError(error instanceof Error ? error.message : 'Erro ao remover troca');
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Minhas Figurinhas Repetidas</h1>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Você ainda não tem figurinhas repetidas.</p>
            <Link href="/pacotes" className="inline-block mt-2 px-6 py-3 bg-brasil-blue text-white rounded-lg font-semibold shadow hover:bg-brasil-blue/90 transition-colors">
              Abra mais pacotes para conseguir figurinhas repetidas!
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Minhas Figurinhas Repetidas</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {figurinhas.map((figurinha) => (
            <div key={figurinha.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-3">
              <div className={`relative w-full aspect-[3/4] rounded-lg border-4 ${getRaridadeStyle(figurinha.raridade)} shadow-lg overflow-hidden`}>
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
                {/* Tag de raridade */}
                {figurinha.raridade && (
                  <div className="absolute top-1 right-1">
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      figurinha.raridade === 'Lendário' ? 'bg-purple-600/80 text-white' :
                      figurinha.raridade === 'Ouro' ? 'bg-yellow-500/80 text-black' :
                      'bg-gray-400/80 text-black'
                    }`}>
                      {figurinha.raridade}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
               

                {figurinha.jogador.time.escudo && (
                  <Image
                    src={figurinha.jogador.time.escudo}
                    alt={figurinha.jogador.time.nome}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                )}
                 <p></p> <p></p>
                <span className="text-sm text-gray-600">{figurinha.jogador.time.nome}</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600">{figurinha.jogador.nome}</span>
                <span className="text-sm font-semibold text-brasil-blue">x{figurinha.quantidade}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                {!figurinhasEmTroca.includes(figurinha.id) && normalize(figurinha.raridade) !== 'lendario' && (
                  <button
                      onClick={() => enviarParaTroca(figurinha)}
                      className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow py-1.5 px-2 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Enviar para troca
                    </button>
                )}
                {figurinhasEmTroca.includes(figurinha.id) && (
                  <button
                    className="text-sm text-brasil-yellow underline hover:text-brasil-blue transition-colors"
                    onClick={() => window.location.href = '/trocas'}
                  >
                    Disponível para troca
                  </button>
                )}
                {normalize(figurinha.raridade) === 'lendario' && (
                    <span className="text-sm text-gray-500 text-center">Figurinha lendária não pode ser trocada</span>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

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