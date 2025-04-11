'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Jogador } from '@/types/jogador';
import { Filtros } from '@/types/filtros';
import { CardJogador } from '@/components/card-jogador';
import { FiltrosAlbum } from '@/components/filtros-album';
import { Loading } from '@/components/loading';

export default function MeuAlbum() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    time: '',
    nacionalidade: '',
    posicao: ''
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
    if (filtros.nacionalidade && jogador.nacionalidade !== filtros.nacionalidade) return false;
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Meu Álbum</h1>
      
      <FiltrosAlbum
        jogadores={jogadores}
        filtros={filtros}
        setFiltros={setFiltros}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {jogadoresFiltrados.map((jogador) => (
          <CardJogador
            key={jogador.id}
            jogador={jogador}
            quantidade={jogador.quantidade}
          />
        ))}
      </div>

      {jogadoresFiltrados.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum jogador encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
} 