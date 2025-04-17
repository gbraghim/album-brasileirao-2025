'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ModalFigurinhas from '@/components/ModalFigurinhas';
import Image from 'next/image';
import { Pacote as PacoteType } from '@/types/pacote';

interface Pacote extends PacoteType {
  // Adicione propriedades adicionais específicas desta página, se necessário
}

interface Jogador {
  id: string;
  figurinhas?: Array<{ id: string }>;
}

interface AlbumResponse {
  jogadores: Jogador[];
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
  const [pacoteAbrindo, setPacoteAbrindo] = useState<string | null>(null);

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
        const data = await response.json() as AlbumResponse;
        const figurinhasIds = new Set<string>();
        
        data.jogadores.forEach(jogador => {
          jogador.figurinhas?.forEach(figurinha => {
            figurinhasIds.add(figurinha.id);
          });
        });
        
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
      setPacoteAbrindo(pacoteId);
      
      const response = await fetch('/api/pacotes/abrir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.email}`,
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
    } catch (err) {
      console.error('Erro ao abrir pacote:', err);
      setError('Ocorreu um erro ao abrir o pacote. Tente novamente mais tarde.');
    } finally {
      setPacoteAbrindo(null);
    }
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    carregarFigurinhasUsuario();
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
    <div className="min-h-screen  bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Meus Pacotes</h1>

      {pacotes.length > 0 ? (
        <div className="mb-4 p-4 bg- rounded-lg">
          <p className="text-lg text-brasil-blue">
            Você tem <span className="font-bold text-brasil-blue">{pacotes.length}</span> pacote{pacotes.length !== 1 ? 's' : ''} disponível{pacotes.length !== 1 ? 's' : ''}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-4 bg- rounded-lg">
          <p className="text-lg text-brasil-blue">Você não tem pacotes disponíveis no momento.</p>
          <p className="text-sm mt-2 text-brasil-blue">Volte amanhã para receber seu pacote diário!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pacotes.map((pacote) => (
          <div
            key={pacote.id}
            className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => handleAbrirPacote(pacote.id)}
          >
            <div className={`relative w-full h-[300px] bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-all duration-500 ${pacoteAbrindo === pacote.id ? 'animate-pacote-aberto' : ''}`}>
              <Image
                src="/pacote-figurinhas.png"
                alt="Pacote de figurinhas"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-4"
              />
              <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm ${pacoteAbrindo === pacote.id ? 'hidden' : ''}`}>
                <button className="bg-brasil-yellow text-brasil-blue font-bold py-3 px-6 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-110">
                  Abrir Pacote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModalFigurinhas
        isOpen={modalAberto}
        onClose={handleFecharModal}
        figurinhas={figurinhasAbertas}
        userFigurinhas={userFigurinhas}
      />
    </div>
  );
} 