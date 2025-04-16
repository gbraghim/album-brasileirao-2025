'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
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
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Dashboard</h1>
        
        {stats && <UserStats stats={stats} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seu Álbum */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-brasil-yellow/20">
            <h2 className="text-2xl font-bold mb-4 text-brasil-blue">Seu Álbum</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-brasil-green/10 rounded-lg">
                <span className="text-brasil-blue font-medium">Progresso do Álbum</span>
                <span className="text-brasil-green font-bold">
                  {stats?.timesCompletos}/{stats?.totalTimes} times completos
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-brasil-yellow/10 rounded-lg">
                <span className="text-brasil-blue font-medium">Figurinhas Únicas</span>
                <span className="text-brasil-yellow font-bold">{stats?.totalFigurinhas}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg">
                <span className="text-brasil-blue font-medium">Figurinhas Repetidas</span>
                <span className="text-red-600 font-bold">{stats?.figurinhasRepetidas}</span>
              </div>
            </div>
          </div>

          {/* Ranking de Colecionadores */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-brasil-yellow/20">
            <h2 className="text-2xl font-bold mb-4 text-brasil-blue">Ranking de Colecionadores</h2>
            {loadingRanking ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {ranking.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      item.email === session.user?.email
                        ? 'bg-brasil-blue/20 border border-brasil-blue'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {index < 3 ? (
                        <div className="w-8 h-8 flex items-center justify-center">
                          {index === 0 && (
                            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 0l2.5 6.5L20 7.5l-5 5 1.5 7.5L10 17l-6.5 3 1.5-7.5-5-5 7.5-1z" />
                            </svg>
                          )}
                          {index === 1 && (
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 0l2.5 6.5L20 7.5l-5 5 1.5 7.5L10 17l-6.5 3 1.5-7.5-5-5 7.5-1z" />
                            </svg>
                          )}
                          {index === 2 && (
                            <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 0l2.5 6.5L20 7.5l-5 5 1.5 7.5L10 17l-6.5 3 1.5-7.5-5-5 7.5-1z" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <span className="w-8 h-8 flex items-center justify-center text-gray-500 font-medium">
                          {index + 1}
                        </span>
                      )}
                      <span className={`font-medium ${
                        item.email === session.user?.email ? 'text-brasil-blue' : 'text-gray-700'
                      }`}>
                        {item.nome}
                      </span>
                    </div>
                    <span className="text-brasil-green font-bold">{item.totalFigurinhas} figurinhas</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 