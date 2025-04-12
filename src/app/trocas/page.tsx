'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/Modal';

interface Figurinha {
  id: string;
  numero: number;
  nome: string;
  posicao: string;
  quantidade: number;
}

interface Troca {
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
}

export default function Trocas() {
  const { data: session } = useSession();
  const [minhasTrocas, setMinhasTrocas] = useState<Troca[]>([]);
  const [trocasDisponiveis, setTrocasDisponiveis] = useState<Troca[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [figurinhasRepetidas, setFigurinhasRepetidas] = useState<Figurinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchTrocas();
      fetchFigurinhasRepetidas();
    }
  }, [session]);

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
      setMinhasTrocas(data.minhasTrocas);
      setTrocasDisponiveis(data.outrasTrocas);
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
      setFigurinhasRepetidas(data.jogadores.map((jogador: any) => ({
        id: jogador.id,
        numero: jogador.numero || 0,
        nome: jogador.nome,
        posicao: jogador.posicao,
        quantidade: jogador.quantidade
      })));
    } catch (error) {
      console.error('Erro ao carregar figurinhas repetidas:', error);
      setError('Erro ao carregar figurinhas repetidas');
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

  if (!session) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>
        <p>Por favor, faça login para acessar a área de trocas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seção "Quero trocar" */}
        <div className="bg-purple-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Quero trocar</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mb-4"
          >
            Adicionar figurinha para troca
          </button>
          <div className="grid grid-cols-2 gap-4">
            {minhasTrocas.map((troca) => (
              <div
                key={troca.id}
                className="bg-purple-700 p-4 rounded-lg"
              >
                <h3 className="font-bold">{troca.figurinhaOferta.jogador.nome}</h3>
                <p className="text-sm">{troca.figurinhaOferta.jogador.posicao}</p>
                <p className="text-sm">#{troca.figurinhaOferta.jogador.numero}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção "Disponível para obter" */}
        <div className="bg-purple-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Disponível para obter</h2>
          <div className="grid grid-cols-2 gap-4">
            {trocasDisponiveis.map((troca) => (
              <div
                key={troca.id}
                className="bg-purple-700 p-4 rounded-lg"
              >
                <h3 className="font-bold">{troca.figurinhaOferta.jogador.nome}</h3>
                <p className="text-sm">{troca.figurinhaOferta.jogador.posicao}</p>
                <p className="text-sm">#{troca.figurinhaOferta.jogador.numero}</p>
                <p className="text-sm mt-2">Oferecido por: {troca.usuarioEnvia.name}</p>
                <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                  Propor troca
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para selecionar figurinha */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Selecione uma figurinha para troca</h2>
          <div className="grid grid-cols-3 gap-4">
            {figurinhasRepetidas.map((figurinha) => (
              <div
                key={figurinha.id}
                className="bg-purple-700 p-4 rounded-lg cursor-pointer hover:bg-purple-600"
                onClick={() => adicionarTroca(figurinha)}
              >
                <h3 className="font-bold text-sm">{figurinha.nome}</h3>
                <p className="text-xs">{figurinha.posicao}</p>
                <p className="text-xs">#{figurinha.numero}</p>
                <p className="text-xs mt-1">Repetidas: {figurinha.quantidade}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
} 