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
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      carregarPacotes();
      carregarRanking();
    }
  }, [status, router]);

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

  const carregarRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Carregando ranking...');
      
      const response = await fetch('/api/ranking', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      console.log('Resposta do ranking:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dados do ranking:', data);
        setRanking(data);
        
        // Encontra a posição do usuário atual no ranking
        const userIndex = data.findIndex((item: RankingItem) => item.id === session?.user?.id);
        setUserPosition(userIndex + 1);
      } else {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        setError('Erro ao carregar ranking');
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      setError('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const getTrophyIcon = (position: number) => {
    switch (position) {
      case 1:
        return (
          <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2M12 4.5L9.75 8.5L5.25 9.12L8.25 12.12L7.5 16.5L12 14.25L16.5 16.5L15.75 12.12L18.75 9.12L14.25 8.5L12 4.5Z" />
          </svg>
        );
      case 2:
        return (
          <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2M12 4.5L9.75 8.5L5.25 9.12L8.25 12.12L7.5 16.5L12 14.25L16.5 16.5L15.75 12.12L18.75 9.12L14.25 8.5L12 4.5Z" />
          </svg>
        );
      case 3:
        return (
          <svg className="w-7 h-7 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2M12 4.5L9.75 8.5L5.25 9.12L8.25 12.12L7.5 16.5L12 14.25L16.5 16.5L15.75 12.12L18.75 9.12L14.25 8.5L12 4.5Z" />
          </svg>
        );
      default:
        return null;
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
      
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-brasil-yellow/20">
        <h2 className="text-xl font-semibold mb-4 text-brasil-blue">Seu Álbum</h2>
        <p className="text-brasil-blue/80 mb-4">
          Aqui você pode gerenciar seu álbum de figurinhas do eBrasileirão 2025.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-brasil-yellow/20">
        <h2 className="text-xl font-semibold mb-4 text-brasil-blue">Ranking de Colecionadores</h2>
        
        {loading && (
          <div className="text-center py-4">
            <p className="text-brasil-blue/80">Carregando ranking...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="space-y-2">
            {ranking.length === 0 ? (
              <p className="text-center text-brasil-blue/80">Nenhum colecionador encontrado</p>
            ) : (
              <>
                {ranking.slice(0, 10).map((item, index) => (
                  <div 
                    key={item.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      item.id === session?.user?.id 
                        ? 'bg-brasil-yellow/20 border border-brasil-yellow' 
                        : 'bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTrophyIcon(index + 1)}
                        <span className="font-bold text-brasil-blue">{index + 1}º</span>
                      </div>
                      <span className={`${item.id === session?.user?.id ? 'font-bold text-brasil-blue' : 'blur-sm'}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-brasil-green font-semibold">{item.figurinhas} figurinhas</span>
                  </div>
                ))}
                
                {userPosition && userPosition > 10 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-brasil-yellow/20 border border-brasil-yellow mt-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brasil-blue">{userPosition}º</span>
                      <span className="font-bold">{session?.user?.name}</span>
                    </div>
                    <span className="text-brasil-green font-semibold">
                      {ranking.find(item => item.id === session?.user?.id)?.figurinhas} figurinhas
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 