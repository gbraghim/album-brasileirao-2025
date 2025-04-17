'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserStats from '@/components/UserStats';

interface UserStats {
  totalPacotes: number;
  totalFigurinhas: number;
  figurinhasRepetidas: number;
  timesCompletos: number;
  totalTimes: number;
}

interface RankingItem {
  id: string;
  nome: string;
  totalFigurinhas: number;
  email: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchStats();
      fetchRanking();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRanking = async () => {
    try {
      setLoadingRanking(true);
      const response = await fetch('/api/ranking');
      if (!response.ok) throw new Error('Erro ao carregar ranking');
      const data = await response.json();
      setRanking(data);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Dashboard</h1>
        
        {stats && <UserStats stats={stats} />}

        {/* Seu Álbum */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-brasil-blue">Seu Álbum</h2>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between p-3 md:p-4 bg-brasil-green/10 rounded-lg">
              <span className="text-sm md:text-base text-brasil-blue font-medium">Progresso do Álbum</span>
              <span className="text-sm md:text-base text-brasil-green font-bold">
                {stats?.timesCompletos}/{stats?.totalTimes} times completos
              </span>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-brasil-yellow/10 rounded-lg">
              <span className="text-sm md:text-base text-brasil-blue font-medium">Figurinhas Únicas</span>
              <span className="text-sm md:text-base text-brasil-yellow font-bold">{stats?.totalFigurinhas}</span>
            </div>
            <div className="flex items-center justify-between p-3 md:p-4 bg-red-100 rounded-lg">
              <span className="text-sm md:text-base text-brasil-blue font-medium">Figurinhas Repetidas</span>
              <span className="text-sm md:text-base text-red-600 font-bold">{stats?.figurinhasRepetidas}</span>
            </div>
          </div>
        </div>

        {/* Ranking de Colecionadores */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-brasil-blue">Ranking de Colecionadores</h2>
          {loading ? (
            <p className="text-gray-500">Carregando ranking...</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {ranking.map((item, index) => (
                <div
                  key={item.email}
                  className="flex items-center justify-between p-3 md:p-4 bg-white/50 rounded-lg"
                >
                  <div className="flex items-center space-x-2 md:space-x-3">
                    {index < 3 ? (
                      <svg 
                        className={`w-5 h-5 md:w-6 md:h-6 ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-400' : 
                          'text-amber-600'
                        }`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <span className="text-sm md:text-base text-gray-400 font-medium">{index + 1}</span>
                    )}
                    <span className={`text-sm md:text-base font-medium ${
                      item.email === session.user?.email ? 'text-brasil-blue' : 'text-gray-700'
                    }`}>
                      {item.nome}
                    </span>
                  </div>
                  <span className="text-sm md:text-base text-brasil-green font-bold">{item.totalFigurinhas} figurinhas</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 