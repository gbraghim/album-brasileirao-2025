'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Jogador } from '@/types/jogador';
import { CardJogador } from '@/components/card-jogador';

interface Figurinha {
  id: string;
  numero: number;
  raridade: string;
  jogador: Jogador;
  quantidade: number;
}

interface TrocaFigurinha {
  id: string;
  figurinha: Figurinha;
  usuario: {
    name: string;
    email: string;
  };
}

export default function Trocas() {
  const { data: session } = useSession();
  const router = useRouter();
  const [minhasTrocas, setMinhasTrocas] = useState<TrocaFigurinha[]>([]);
  const [outrasTrocas, setOutrasTrocas] = useState<TrocaFigurinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    fetchTrocas();
  }, [session, router]);

  const fetchTrocas = async () => {
    try {
      const response = await fetch('/api/trocas');
      if (!response.ok) {
        throw new Error('Erro ao buscar trocas');
      }
      const data = await response.json();
      setMinhasTrocas(data.minhasTrocas);
      setOutrasTrocas(data.outrasTrocas);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao carregar trocas');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Minhas figurinhas para troca */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Minhas Figurinhas para Troca</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {minhasTrocas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {minhasTrocas.map((troca) => (
                  <div key={troca.id} className="relative">
                    <CardJogador jogador={troca.figurinha.jogador} quantidade={1} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center">
                Você ainda não tem figurinhas disponíveis para troca.
              </p>
            )}
          </div>
        </div>

        {/* Figurinhas disponíveis para troca */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Figurinhas Disponíveis para Troca</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {outrasTrocas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outrasTrocas.map((troca) => (
                  <div key={troca.id} className="relative">
                    <CardJogador jogador={troca.figurinha.jogador} quantidade={1} />
                    <div className="absolute bottom-2 right-2 bg-gray-100 px-3 py-1 rounded-md text-sm">
                      Oferecido por: {troca.usuario.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center">
                Não há figurinhas disponíveis para troca no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 