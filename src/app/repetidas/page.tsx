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

export default function Repetidas() {
  const { data: session } = useSession();
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRepetidas = async () => {
      try {
        const response = await fetch('/api/figurinhas/repetidas');
        if (!response.ok) {
          throw new Error('Erro ao buscar figurinhas repetidas');
        }
        const data = await response.json();
        setFigurinhas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar figurinhas');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchRepetidas();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Área Restrita</h1>
          <p className="text-xl mb-6">Faça login para ver suas figurinhas repetidas</p>
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
        <h1 className="text-4xl font-bold text-white mb-8">Minhas Figurinhas Repetidas</h1>
        
        {figurinhas.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center text-white">
            <p className="text-xl">Você ainda não tem figurinhas repetidas.</p>
            <Link
              href="/album"
              className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Ver Meu Álbum
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {figurinhas.map((figurinha) => (
              <div
                key={figurinha.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={`/players/${figurinha.numero}.jpg`}
                    alt={`Figurinha ${figurinha.numero}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 text-white">
                  <p className="text-center font-bold">#{figurinha.numero}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 