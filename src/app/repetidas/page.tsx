'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';

interface Figurinha {
  id: string;
  numero: number;
  nome: string;
  posicao: string;
  quantidade: number;
  time: string;
}

export default function Repetidas() {
  const { data: session } = useSession();
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFigurinha, setSelectedFigurinha] = useState<Figurinha | null>(null);

  useEffect(() => {
    if (session) {
      fetchFigurinhasRepetidas();
    }
  }, [session]);

  const fetchFigurinhasRepetidas = async () => {
    try {
      const response = await fetch('/api/repetidas');
      if (!response.ok) {
        throw new Error('Erro ao buscar figurinhas repetidas');
      }
      const data = await response.json();
      setFigurinhas(data.jogadores.map((jogador: any) => ({
        id: jogador.id,
        numero: jogador.numero || 0,
        nome: jogador.nome,
        posicao: jogador.posicao,
        quantidade: jogador.quantidade,
        time: jogador.time
      })));
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
        throw new Error(data.error || 'Erro ao disponibilizar figurinha para troca');
      }

      setSelectedFigurinha(figurinha);
      setShowSuccessModal(true);
      fetchFigurinhasRepetidas(); // Recarrega a lista de figurinhas
    } catch (error) {
      console.error('Erro ao enviar figurinha para troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao enviar figurinha para troca');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Figurinhas Repetidas</h1>
        <p>Por favor, faça login para acessar suas figurinhas repetidas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-900 text-white flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchFigurinhasRepetidas();
          }}
          className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Figurinhas Repetidas</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {figurinhas.map((figurinha) => (
            <div
              key={figurinha.id}
              className="bg-purple-800 p-4 rounded-lg"
            >
              <h3 className="font-bold">#{figurinha.numero} - {figurinha.nome}</h3>
              <p className="text-sm">{figurinha.posicao}</p>
              <p className="text-sm">{figurinha.time}</p>
              <p className="text-sm mt-2">Repetidas: {figurinha.quantidade}</p>
              <button
                onClick={() => enviarParaTroca(figurinha)}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm w-full"
              >
                Disponibilizar para Troca
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de sucesso */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-green-500">Sucesso!</h2>
          <p className="mb-4">
            A figurinha #{selectedFigurinha?.numero} - {selectedFigurinha?.nome} foi disponibilizada para troca com sucesso!
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 