'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ModalFigurinhas from '@/components/ModalFigurinhas';
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
      idade: number;
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
      const response = await fetch('/api/pacotes/abrir', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pacoteId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao abrir pacote');
      }

      const data = await response.json();
      // Marca as figurinhas como novas ou repetidas
      const figurinhasProcessadas = data.figurinhas.map((fig: any) => ({
        ...fig,
        nova: !userFigurinhas.has(fig.jogador.id)
      }));
      console.log('Figurinhas processadas:', figurinhasProcessadas);
      setFigurinhasAbertas(figurinhasProcessadas);
      setModalAberto(true);
      carregarPacotes(); // Recarrega os pacotes após abrir
      carregarFigurinhasUsuario(); // Atualiza a lista de figurinhas do usuário
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-brasil-blue">Meus Pacotes</h1>
          <span className="text-lg text-brasil-blue bg-brasil-yellow/20 px-4 py-2 rounded-lg">
            {pacotes.length} {pacotes.length === 1 ? 'pacote disponível' : 'pacotes disponíveis'}
          </span>
        </div>
        
        {pacotes.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <p className="text-brasil-blue">Adquira mais pacotes e complete seu álbum!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pacotes.map((pacote) => (
              <div
                key={pacote.id}
                className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => handleAbrirPacote(pacote.id)}
              >
                <div className="relative w-full h-[300px] bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                  <Image
                    src="/pacote-figurinhas.png"
                    alt="Pacote de Figurinhas"
                    fill
                    className="object-contain p-4"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-brasil-blue/80 backdrop-blur-sm">
                    <button className="bg-brasil-yellow text-brasil-blue font-bold py-3 px-6 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-110">
                      Abrir Pacote
                    </button>
                  </div>
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