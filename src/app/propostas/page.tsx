'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';

interface Proposta {
  id: string;
  tipo: string;
  mensagem: string;
  lida: boolean;
  troca: {
    id: string;
    figurinhaOferta: {
      jogador: {
        nome: string;
        posicao: string;
        numero: number;
      }
    };
    usuarioEnvia: {
      name: string;
      email: string;
    };
  };
}

export default function Propostas() {
  const { data: session } = useSession();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState<Proposta | null>(null);

  useEffect(() => {
    if (session) {
      fetchPropostas();
    }
  }, [session]);

  const fetchPropostas = async () => {
    try {
      const response = await fetch('/api/notificacoes');
      if (!response.ok) {
        throw new Error('Erro ao buscar propostas');
      }
      const data = await response.json();
      setPropostas(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
      setError('Erro ao carregar propostas');
      setLoading(false);
    }
  };

  const responderProposta = async (tipo: 'aceitar' | 'recusar') => {
    if (!selectedProposta) return;

    try {
      const response = await fetch('/api/notificacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trocaId: selectedProposta.troca.id,
          tipo,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao responder proposta');
      }

      setShowModal(false);
      await fetchPropostas();
    } catch (error) {
      console.error('Erro ao responder proposta:', error);
      setError('Erro ao responder proposta');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-200 to-yellow-200 text-gray-800 p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Propostas de Troca</h1>
        <p>Por favor, faça login para acessar suas propostas de troca.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-200 to-yellow-200 text-gray-800 p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Propostas de Troca</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-200 to-yellow-200 text-gray-800 p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Propostas de Troca</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 to-yellow-200 text-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Propostas de Troca</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propostas.map((proposta) => (
            <div
              key={proposta.id}
              className="bg-white bg-opacity-80 p-6 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {proposta.troca.figurinhaOferta.jogador.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    #{proposta.troca.figurinhaOferta.jogador.numero} -{' '}
                    {proposta.troca.figurinhaOferta.jogador.posicao}
                  </p>
                </div>
                {!proposta.lida && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Nova
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-4">
                Proposta de troca de {proposta.troca.usuarioEnvia.name}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProposta(proposta);
                    setShowModal(true);
                  }}
                  className="flex-1  hover: text-white px-4 py-2 rounded-lg"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => {
                    setSelectedProposta(proposta);
                    responderProposta('recusar');
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmação */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Confirmar troca</h2>
          <p className="mb-4">
            Você está prestes a aceitar a troca da figurinha de{' '}
            {selectedProposta?.troca.figurinhaOferta.jogador.nome} com{' '}
            {selectedProposta?.troca.usuarioEnvia.name}. Deseja continuar?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={() => responderProposta('aceitar')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 