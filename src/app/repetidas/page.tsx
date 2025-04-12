'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface Figurinha {
  id: string;
  jogadorId: string;
  jogador?: {
    id: string;
    nome: string;
    posicao: string;
  };
}

interface FigurinhaRepetida {
  jogadorId: string;
  nome: string;
  posicao: string;
  quantidade: number;
}

export default function Repetidas() {
  const { data: session } = useSession();
  const [figurinhas, setFigurinhas] = useState<FigurinhaRepetida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      carregarFigurinhasRepetidas();
    }
  }, [session]);

  const carregarFigurinhasRepetidas = async () => {
    try {
      const response = await fetch('/api/repetidas');
      if (!response.ok) {
        throw new Error('Erro ao buscar figurinhas repetidas');
      }
      const data = await response.json();
      
      // Transformar os dados para o formato esperado
      const repetidas = data.jogadores.map((jogador: any) => ({
        jogadorId: jogador.id,
        nome: jogador.nome,
        posicao: jogador.posicao,
        quantidade: jogador.quantidade
      }));
      
      setFigurinhas(repetidas);
    } catch (error) {
      console.error('Erro ao carregar figurinhas repetidas:', error);
      setError('Erro ao carregar figurinhas repetidas');
    } finally {
      setLoading(false);
    }
  };

  const enviarParaTroca = (figurinhaId: string) => {
    console.log(`Enviar figurinha ${figurinhaId} para troca`);
    // Implementar lógica de envio para troca
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Minhas Figurinhas Repetidas</h1>
        <p>Por favor, faça login para ver suas figurinhas repetidas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Minhas Figurinhas Repetidas</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Minhas Figurinhas Repetidas</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Minhas Figurinhas Repetidas</h1>
      
      {figurinhas.length === 0 ? (
        <p>Você ainda não tem figurinhas repetidas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {figurinhas.map((figurinha) => (
            <div
              key={`${figurinha.jogadorId}-${figurinha.quantidade}`}
              className="bg-purple-800 rounded-lg p-6 shadow-lg hover:bg-purple-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{figurinha.nome}</h3>
                  <p className="text-purple-300">{figurinha.posicao}</p>
                </div>
                <div className="bg-purple-600 px-3 py-1 rounded-full">
                  <span className="text-lg font-bold">{figurinha.quantidade}x</span>
                </div>
              </div>
              
              <button
                onClick={() => enviarParaTroca(figurinha.jogadorId)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Disponibilizar para Troca
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 