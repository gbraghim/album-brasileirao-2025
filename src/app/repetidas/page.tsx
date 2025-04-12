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
        quantidade: jogador.quantidade
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
      setSelectedFigurinha(figurinha);
      const response = await fetch('/api/trocas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ figurinhaId: figurinha.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar figurinha para troca');
      }

      setShowSuccessModal(true);
      await fetchFigurinhasRepetidas(); // Recarrega as figurinhas após enviar para troca
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
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Figurinhas Repetidas</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Figurinhas Repetidas</h1>
        <p className="text-red-400">{error}</p>
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
              <h3 className="font-bold">{figurinha.nome}</h3>
              <p className="text-sm">{figurinha.posicao}</p>
              <p className="text-sm">#{figurinha.numero}</p>
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
            A figurinha de {selectedFigurinha?.nome} foi disponibilizada para troca com sucesso!
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