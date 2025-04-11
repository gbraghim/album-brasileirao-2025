'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/Modal';

interface Figurinha {
  id: string;
  numero: number;
  repetida: boolean;
  pacoteId: string;
  nome: string;
  posicao: string;
}

interface Troca {
  id: string;
  figurinha: Figurinha;
  status: 'disponivel' | 'pendente' | 'concluida';
  usuarioId: string;
}

export default function Trocas() {
  const { data: session } = useSession();
  const [minhasTrocas, setMinhasTrocas] = useState<Troca[]>([]);
  const [trocasDisponiveis, setTrocasDisponiveis] = useState<Troca[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [figurinhasRepetidas, setFigurinhasRepetidas] = useState<Figurinha[]>([]);

  useEffect(() => {
    if (session) {
      carregarTrocas();
    }
  }, [session]);

  const carregarTrocas = async () => {
    try {
      // Simulação de dados - substituir por chamadas à API
      const minhasTrocasMock: Troca[] = [
        {
          id: '1',
          figurinha: {
            id: '1',
            numero: 10,
            repetida: true,
            pacoteId: '123',
            nome: 'Neymar',
            posicao: 'Atacante'
          },
          status: 'disponivel',
          usuarioId: session?.user?.id || ''
        }
      ];

      const trocasDisponiveisMock: Troca[] = [
        {
          id: '2',
          figurinha: {
            id: '2',
            numero: 9,
            repetida: true,
            pacoteId: '456',
            nome: 'Gabigol',
            posicao: 'Atacante'
          },
          status: 'disponivel',
          usuarioId: 'outro-usuario'
        }
      ];

      setMinhasTrocas(minhasTrocasMock);
      setTrocasDisponiveis(trocasDisponiveisMock);
    } catch (error) {
      console.error('Erro ao carregar trocas:', error);
    }
  };

  const adicionarTroca = async (figurinha: Figurinha) => {
    try {
      // Simulação de adição de troca - substituir por chamada à API
      const novaTroca: Troca = {
        id: Date.now().toString(),
        figurinha,
        status: 'disponivel',
        usuarioId: session?.user?.id || ''
      };

      setMinhasTrocas([...minhasTrocas, novaTroca]);
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao adicionar troca:', error);
    }
  };

  const selecionarFigurinha = (figurinha: Figurinha) => {
    adicionarTroca(figurinha);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>
        <p>Por favor, faça login para acessar a área de trocas.</p>
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
                <img
                  src={`/players/${troca.figurinha.numero}.jpg`}
                  alt={troca.figurinha.nome}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold">{troca.figurinha.nome}</h3>
                <p className="text-sm">{troca.figurinha.posicao}</p>
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
                <img
                  src={`/players/${troca.figurinha.numero}.jpg`}
                  alt={troca.figurinha.nome}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold">{troca.figurinha.nome}</h3>
                <p className="text-sm">{troca.figurinha.posicao}</p>
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
                onClick={() => selecionarFigurinha(figurinha)}
              >
                <img
                  src={`/players/${figurinha.numero}.jpg`}
                  alt={figurinha.nome}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-sm">{figurinha.nome}</h3>
                <p className="text-xs">{figurinha.posicao}</p>
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