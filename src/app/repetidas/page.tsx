'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';

interface Figurinha {
  id: string;
  numero: number;
  nome: string;
  posicao: string;
  idade: number;
  nacionalidade: string;
  foto: string;
  quantidade: number;
  time: {
    id: string;
    nome: string;
    escudo: string;
  };
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
      if (!data || !Array.isArray(data)) {
        setFigurinhas([]);
        return;
      }
      setFigurinhas(data.map((figurinha: any) => ({
        id: figurinha.id || '',
        numero: figurinha.numero || 0,
        nome: figurinha.nome || '',
        posicao: figurinha.posicao || '',
        idade: figurinha.idade || 0,
        nacionalidade: figurinha.nacionalidade || '',
        foto: figurinha.foto || '',
        quantidade: (figurinha.quantidade || 1) - 1, // Quantidade de repetidas (total - 1)
        time: {
          id: figurinha.time?.id || '',
          nome: figurinha.time?.nome || '',
          escudo: figurinha.time?.escudo || ''
        }
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
    <div className="min-h-screen  text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Minhas Figurinhas Repetidas</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {figurinhas.map((figurinha) => (
            <div key={figurinha.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
              <div className="flex items-center mb-4">
                <img
                  src={figurinha.time.escudo}
                  alt={figurinha.time.nome}
                  className="w-12 h-12 object-contain mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold">{figurinha.nome}</h3>
                  <p className="text-gray-600">{figurinha.time.nome}</p>
                </div>
              </div>
              <div className="flex-grow">
                {figurinha.foto && (
                  <img
                    src={figurinha.foto}
                    alt={figurinha.nome}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-white mb-2">{figurinha.nome}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-semibold">Número:</span> {figurinha.numero}</p>
                  <p><span className="font-semibold">Posição:</span> {figurinha.posicao}</p>
                  <p><span className="font-semibold">Idade:</span> {figurinha.idade}</p>
                  <p><span className="font-semibold">Nacionalidade:</span> {figurinha.nacionalidade}</p>
                  <p className="col-span-2">
                    <span className="font-semibold">Repetidas:</span> {figurinha.quantidade - 1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => enviarParaTroca(figurinha)}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Disponibilizar para Troca'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de sucesso */}
      {showSuccessModal && selectedFigurinha && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-green-500">Sucesso!</h2>
            <p className="mb-4">
              A figurinha {selectedFigurinha.nome} foi disponibilizada para troca com sucesso!
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
      )}
    </div>
  );
} 