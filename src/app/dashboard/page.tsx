'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RankingItem {
  id: string;
  name: string;
  figurinhas: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pacotes, setPacotes] = useState(0);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      carregarPacotes();
      carregarRanking();
    }
  }, [status, router]);

  const carregarRanking = async () => {
    try {
      const response = await fetch('/api/ranking', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRanking(data);
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
    } finally {
      setLoadingRanking(false);
    }
  };

  const carregarPacotes = async () => {
    try {
      const response = await fetch('/api/pacotes', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPacotes(data.filter((pacote: any) => !pacote.aberto).length);
      }
    } catch (err) {
      console.error('Erro ao carregar pacotes:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Bem-vindo, {session?.user?.name}!</h1>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-brasil-yellow/20">
        <h2 className="text-xl font-semibold mb-4 text-brasil-blue">Seu Álbum</h2>
        <p className="text-brasil-blue/80 mb-4">
          Aqui você pode gerenciar seu álbum de figurinhas do eBrasileirão 2025.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div 
            className="bg-brasil-blue/10 p-4 rounded-lg cursor-pointer hover:bg-brasil-blue/20 transition-colors"
            onClick={() => router.push('/meu-album')}
          >
            <h3 className="font-medium text-brasil-blue mb-2">Suas Figurinhas</h3>
            <p className="text-brasil-blue/80">Visualize todas as suas figurinhas</p>
          </div>
          <div 
            className="bg-brasil-green/10 p-4 rounded-lg cursor-pointer hover:bg-brasil-green/20 transition-colors"
            onClick={() => router.push('/pacotes')}
          >
            <h3 className="font-medium text-brasil-green mb-2">Pacotes Disponíveis</h3>
            <p className="text-brasil-green/80">
              {pacotes === 0 
                ? "Compre pacotes para completar seu álbum!" 
                : "Abra seus pacotes e colecione mais craques!"}
            </p>
          </div>
        </div>

        <div className="border-t border-brasil-yellow/20 pt-6">
          <h2 className="text-xl font-semibold mb-4 text-brasil-blue">Ranking de Colecionadores</h2>
          {loadingRanking ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brasil-blue"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {ranking.map((item, index) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.id === session?.user?.id 
                      ? 'bg-brasil-blue/20 border border-brasil-blue' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    {index === 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : index === 1 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : index === 2 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <span className="text-brasil-blue font-bold mr-3">{index + 1}º</span>
                    )}
                    <span className={item.id === session?.user?.id ? 'font-bold text-brasil-blue' : ''}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-brasil-green font-bold">{item.figurinhas} figurinhas</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 