'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ModalFigurinhas from '@/components/ModalFigurinhas';

interface Pacote {
  id: string;
  tipo: string;
  dataCriacao: string;
  figurinhas: {
    id: string;
    jogador: {
      nome: string;
      time: string;
      posicao: string;
      idade: number;
      foto: string;
    };
  }[];
}

export default function Pacotes() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [figurinhasAbertas, setFigurinhasAbertas] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      carregarPacotes();
    }
  }, [status, router]);

  const carregarPacotes = async () => {
    try {
      const response = await fetch('/api/pacotes', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Erro ao carregar pacotes');
      }

      const data = await response.json();
      setPacotes(data.filter((pacote: any) => !pacote.aberto));
    } catch (err) {
      setError('Erro ao carregar pacotes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirPacote = async (pacoteId: string) => {
    try {
      const response = await fetch(`/api/pacotes/${pacoteId}/abrir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao abrir pacote');
      }

      const data = await response.json();
      setFigurinhasAbertas(data.figurinhas);
      setModalAberto(true);
      carregarPacotes(); // Recarrega os pacotes após abrir
    } catch (err) {
      setError('Erro ao abrir pacote');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pacotes</h1>
        
        {pacotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Você não tem pacotes disponíveis</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pacotes.map((pacote) => (
              <div
                key={pacote.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-center">
                    <h2 className="text-xl font-bold text-white mb-2">BRASILEIRÃO 2025</h2>
                    <p className="text-white text-sm">
                      {new Date(pacote.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAbrirPacote(pacote.id)}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Abrir Pacote
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalFigurinhas
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        figurinhas={figurinhasAbertas}
      />
    </div>
  );
} 