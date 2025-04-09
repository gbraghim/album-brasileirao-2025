'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface Figurinha {
  id: string;
  numero: number;
  repetida: boolean;
  pacoteId: string;
}

interface Troca {
  id: string;
  figurinhaId: string;
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA';
  createdAt: string;
  figurinha: Figurinha;
}

export default function Trocas() {
  const { data: session } = useSession();
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrocas = async () => {
      try {
        const response = await fetch('/api/trocas');
        if (!response.ok) {
          throw new Error('Erro ao buscar trocas');
        }
        const data = await response.json();
        setTrocas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar trocas');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTrocas();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Área Restrita</h1>
          <p className="text-xl mb-6">Faça login para ver suas trocas</p>
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Minhas Trocas</h1>
        
        {trocas.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center text-white">
            <p className="text-xl">Você ainda não tem trocas.</p>
            <Link
              href="/repetidas"
              className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Ver Minhas Repetidas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trocas.map((troca) => (
              <div
                key={troca.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white"
              >
                <div className="relative h-48 mb-4">
                  <Image
                    src={`/players/${troca.figurinha.numero}.jpg`}
                    alt={`Figurinha ${troca.figurinha.numero}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-center font-bold">#{troca.figurinha.numero}</p>
                  <p className="text-center">
                    Status: {troca.status}
                  </p>
                  <p className="text-center text-sm text-gray-300">
                    {new Date(troca.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 