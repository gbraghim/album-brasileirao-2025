'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

interface Figurinha {
  id: string;
  quantidade: number;
}

interface Jogador {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  idade: number;
  nacionalidade: string;
  foto: string;
  time: {
    nome: string;
    escudo: string;
  };
  figurinhas: Figurinha[];
}

interface AlbumResponse {
  jogadores: Jogador[];
}

export default function MeuAlbum() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchJogadores();
    }
  }, [status, router]);

  const fetchJogadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/meu-album', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar álbum');
      }

      const data = await response.json() as AlbumResponse;
      setJogadores(data.jogadores);
    } catch (err) {
      console.error('Erro ao carregar álbum:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar álbum');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchJogadores();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Header />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Meu Álbum</h1>

        {jogadores.length === 0 ? (
          <div className="text-center py-12  rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Seu álbum está vazio!</h2>
            <p className="text-lg mb-6">Comece sua coleção abrindo pacotes de figurinhas.</p>
            <Link 
              href="/pacotes" 
              className="inline-block hover: text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Abrir Pacotes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jogadores.map((jogador) => (
              <div 
                key={jogador.id}
                className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-brasil-yellow/20 relative transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex flex-col">
                  <h4 className="text-lg font-semibold text-brasil-blue">
                    #{jogador.numero} - {jogador.nome}
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium text-brasil-green">Time:</span>{' '}
                      <span className="text-brasil-blue">{jogador.time.nome}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-brasil-green">Posição:</span>{' '}
                      <span className="text-brasil-blue">{jogador.posicao}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-brasil-green">Idade:</span>{' '}
                      <span className="text-brasil-blue">{jogador.idade} anos</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-brasil-green">Nacionalidade:</span>{' '}
                      <span className="text-brasil-blue">{jogador.nacionalidade}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-brasil-green">Quantidade:</span>{' '}
                      <span className="text-brasil-blue">{jogador.figurinhas.reduce((acc: number, f: Figurinha) => acc + f.quantidade, 0)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 