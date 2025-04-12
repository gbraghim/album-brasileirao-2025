'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Jogador } from '@/types/jogador';
import { Filtros } from '@/types/filtros';
import FiltrosRepetidas from '@/components/FiltrosRepetidas';
import { CardJogador } from '@/components/card-jogador';

interface Figurinha {
  id: string;
  numero: number;
  raridade: string;
  jogador: Jogador;
  quantidade: number;
}

export default function Repetidas() {
  const { data: session } = useSession();
  const router = useRouter();
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    time: '',
    posicao: '',
    raridade: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    fetchFigurinhas();
  }, [session, router]);

  const fetchFigurinhas = async () => {
    try {
      const response = await fetch('/api/repetidas');
      if (!response.ok) {
        throw new Error('Erro ao buscar figurinhas repetidas');
      }
      const data = await response.json();
      setFigurinhas(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao carregar figurinhas repetidas');
      setLoading(false);
    }
  };

  const enviarParaTroca = async (figurinhaId: string) => {
    try {
      const response = await fetch('/api/trocas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ figurinhaId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar figurinha para troca');
      }

      // Atualizar a lista de figurinhas após enviar para troca
      await fetchFigurinhas();
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao enviar figurinha para troca');
    }
  };

  const filtrarFigurinhas = (figurinha: Figurinha) => {
    return (
      (!filtros.time || figurinha.jogador.time.nome === filtros.time) &&
      (!filtros.posicao || figurinha.jogador.posicao === filtros.posicao) &&
      (!filtros.raridade || figurinha.raridade === filtros.raridade) &&
      (!filtros.search ||
        figurinha.jogador.nome.toLowerCase().includes(filtros.search.toLowerCase()))
    );
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
      <h1 className="text-3xl font-bold mb-8">Minhas Figurinhas Repetidas</h1>
      
      <FiltrosRepetidas filtros={filtros} onFiltrosChange={setFiltros} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {figurinhas.filter(filtrarFigurinhas).map((figurinha) => (
          <div key={figurinha.id} className="relative">
            <CardJogador jogador={figurinha.jogador} quantidade={figurinha.quantidade} />
            <button
              onClick={() => enviarParaTroca(figurinha.id)}
              className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Enviar para Troca
            </button>
          </div>
        ))}
      </div>

      {figurinhas.length === 0 && (
        <div className="text-center text-gray-600 mt-8">
          Você ainda não tem figurinhas repetidas.
        </div>
      )}
    </div>
  );
} 