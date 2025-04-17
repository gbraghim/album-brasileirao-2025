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
      const [repetidasResponse, trocasResponse] = await Promise.all([
        fetch('/api/repetidas'),
        fetch('/api/trocas')
      ]);

      if (!repetidasResponse.ok || !trocasResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const [repetidasData, trocasData] = await Promise.all([
        repetidasResponse.json(),
        trocasResponse.json()
      ]);

      // Extrair IDs das figurinhas em troca do usuário atual
      const figurinhasEmTrocaIds = Array.isArray(trocasData.minhasTrocas) 
        ? trocasData.minhasTrocas
            .map((t: any) => t.figurinha?.id)
            .filter(Boolean)
        : [];
      setFigurinhasEmTroca(figurinhasEmTrocaIds);

      // Mapear figurinhas repetidas
      setFigurinhas(repetidasData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar figurinhas repetidas:', error);
      setError('Erro ao carregar figurinhas repetidas');
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

  const figurinhasFormatadas = figurinhas.map((figurinha) => ({
    id: figurinha.id,
    jogador: {
      id: figurinha.jogador.id,
      nome: figurinha.jogador.nome,
      nacionalidade: figurinha.jogador.nacionalidade,
      time: {
        nome: figurinha.jogador.time.nome,
        escudo: figurinha.jogador.time.escudo,
      },
    },
    quantidade: figurinha.quantidade,
    raridade: figurinha.raridade,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Minhas Figurinhas Repetidas</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {figurinhasFormatadas.map((figurinha) => (
            <div key={figurinha.id} className="bg-gradient-to-br from-white via-blue-100 to-blue-500 rounded-lg shadow-md p-4 flex flex-col">
              <div className="flex items-center mb-4">
                {figurinha.jogador.time.escudo && (
                  <img
                    src={figurinha.jogador.time.escudo}
                    alt={figurinha.jogador.time.nome}
                    className="w-12 h-12 object-contain mr-4"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{figurinha.jogador.nome}</h3>
                  <p className="text-gray-600">{figurinha.jogador.time.nome}</p>
                </div>
              </div>
              <div className="flex-grow">
                {figurinha.jogador.time.escudo && (
                  <img
                    src={figurinha.jogador.time.escudo}
                    alt={figurinha.jogador.nome}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="space-y-2">
                  <p className="text-gray-800"><span className="font-semibold">Time:</span> {figurinha.jogador.time.nome}</p>
                  <p className="text-gray-800"><span className="font-semibold">Nacionalidade:</span> {figurinha.jogador.nacionalidade}</p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Repetidas:</span> {figurinha.quantidade}
                  </p>
                </div>
              </div>
              {figurinhasEmTroca.includes(figurinha.id) ? (
                <button
                  className="mt-4 bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Figurinha já disponibilizada para troca
                </button>
              ) : (
                <button
                  onClick={() => enviarParaTroca(figurinha)}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Disponibilizar para Troca'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de erro */}
      {showErrorModal && (
        <Modal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
        >
          <div className="bg-gradient-to-br from-white via-blue-100 to-blue-500 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Atenção!</h2>
            <p className="mb-4 text-gray-800">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de sucesso */}
      {showSuccessModal && selectedFigurinha && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        >
          <div className="bg-gradient-to-br from-white via-blue-100 to-blue-500 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-green-500">Sucesso!</h2>
            <p className="mb-4 text-gray-800">
              A figurinha {selectedFigurinha.jogador.nome} foi disponibilizada para troca com sucesso!
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 