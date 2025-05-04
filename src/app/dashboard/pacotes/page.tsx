'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Pacote {
  id: string;
  tipo: string;
  dataCriacao: string;
  figurinhas: {
    id: string;
    jogador: {
      nome: string;
      time: {
        nome: string;
      };
      posicao: string;
    };
  }[];
}

const ModalFigurinhas = lazy(() => import('@/components/ModalFigurinhas'));

export default function Pacotes() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [figurinhasAbertas, setFigurinhasAbertas] = useState<any[]>([]);
  const [userFigurinhas, setUserFigurinhas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      carregarPacotes();
      carregarFigurinhasUsuario();
    }
  }, [status, router]);

  const carregarFigurinhasUsuario = async () => {
    try {
      const response = await fetch('/api/meu-album', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const jogadores = data.jogadores as Array<{ id: string }>;
        const figurinhasIds = new Set(jogadores.map(j => j.id));
        setUserFigurinhas(figurinhasIds);
      }
    } catch (err) {
      console.error('Erro ao carregar figurinhas do usuário:', err);
    }
  };

  const carregarPacotes = async () => {
    try {
      if (!session?.user?.email) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/pacotes', {
        headers: {
          'Authorization': `Bearer ${session.user.email}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Erro ao carregar pacotes';
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      setPacotes(data.filter((pacote: any) => !pacote.aberto));
    } catch (err) {
      console.error('Erro ao carregar pacotes:', err);
      setError('Ocorreu um erro ao carregar os pacotes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirPacote = async (pacoteId: string) => {
    try {
      const response = await fetch('/api/pacotes/abrir', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pacoteId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Erro ao abrir pacote';
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      setFigurinhasAbertas(data.figurinhas);
      setModalAberto(true);
      carregarPacotes();
      carregarFigurinhasUsuario();
    } catch (err) {
      console.error('Erro ao abrir pacote:', err);
      setError('Ocorreu um erro ao abrir o pacote. Tente novamente mais tarde.');
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
            carregarPacotes();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-brasil-blue">Meus Pacotes</h1>
      
      {pacotes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-green-600">Você não tem pacotes disponíveis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pacotes.map((pacote) => (
            <div
              key={pacote.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pacote {pacote.tipo}</h2>
                <span className="text-sm text-gray-500">
                  {new Date(pacote.dataCriacao).toLocaleDateString()}
                </span>
              </div>
              <div className="relative w-full h-[300px]">
                <Image
                  src="/pacote-figurinhas.png"
                  alt="Pacote de Figurinhas"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain"
                />
              </div>
              <button
                onClick={() => handleAbrirPacote(pacote.id)}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors mt-4"
              >
                Abrir Pacote
              </button>
            </div>
          ))}
        </div>
      )}

      <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
        <ModalFigurinhas
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          figurinhas={figurinhasAbertas}
          userFigurinhas={userFigurinhas}
        />
      </Suspense>
    </div>
  );
} 