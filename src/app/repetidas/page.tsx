'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';

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
            <p className="text-gray-600">Abra mais pacotes para conseguir figurinhas repetidas!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Minhas Figurinhas Repetidas</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {figurinhas.map((figurinha) => (
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
                  onClick={() => enviarParaTroca(figurinha)}
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