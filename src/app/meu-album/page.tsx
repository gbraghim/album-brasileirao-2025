'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Jogador } from '@/types/jogador';
import { Filtros } from '@/types/filtros';
import { CardJogador } from '@/components/card-jogador';
import FiltrosAlbum from '@/components/FiltrosAlbum';
import { Loading } from '@/components/loading';
import Header from '@/components/Header';
import Link from 'next/link';

export default function MeuAlbum() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    time: '',
    posicao: '',
    raridade: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const carregarJogadores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!session?.user?.email) {
          throw new Error('Usuário não autenticado');
        }

        const response = await fetch('/api/meu-album', {
          headers: {
            'Authorization': `Bearer ${session.user.email}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao carregar álbum');
        }

        const data = await response.json();
        setJogadores(data.jogadores);
      } catch (err) {
        console.error('Erro ao carregar jogadores:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar álbum');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      carregarJogadores();
    }
  }, [session]);

  const jogadoresFiltrados = jogadores.filter(jogador => {
    if (filtros.time && jogador.time.nome !== filtros.time) return false;
    if (filtros.posicao && jogador.posicao !== filtros.posicao) return false;
    return true;
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Meu Álbum</h1>

      {jogadores.length === 0 ? (
        <div className="text-center py-12 bg-purple-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Seu álbum está vazio!</h2>
          <p className="text-lg mb-6">Comece sua coleção abrindo pacotes de figurinhas.</p>
          <Link 
            href="/pacotes" 
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Abrir Pacotes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jogadores.map((jogador) => (
            <CardJogador
              key={jogador.id}
              jogador={jogador}
              quantidade={jogador.quantidade}
            />
          ))}
        </div>
      )}
    </div>
  );
} 