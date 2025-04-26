'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserStats from '@/components/UserStats';
import type { UserStats as UserStatsType } from '@/types/stats';

interface RankingItem {
  id: string;
  nome: string;
  totalFigurinhas: number;
  email: string;
  posicao: number;
}

interface RankingData {
  ranking: RankingItem[];
  usuarioAtual?: RankingItem;
}

export default function Dashboard() {
  console.log('1. Iniciando renderização do Dashboard');
  
  const { data: session, status } = useSession();
  console.log('2. Status da sessão:', status);
  
  const router = useRouter();
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(true);

  useEffect(() => {
    console.log('3. useEffect executado - status:', status);
    if (status === 'unauthenticated') {
      console.log('4. Usuário não autenticado, redirecionando...');
      router.push('/login');
    } else if (status === 'authenticated') {
      console.log('4. Usuário autenticado, buscando dados...');
      fetchStats();
      fetchRanking();
    }
  }, [status, router]);

  const fetchStats = async () => {
    console.log('5. Iniciando fetchStats');
    try {
      console.log('6. Fazendo requisição para /api/stats');
      const response = await fetch('/api/stats');
      console.log('7. Resposta recebida - status:', response.status);
      
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');
      
      const data = await response.json();
      console.log('8. Dados recebidos da API:', {
        totalPacotes: data.totalPacotes,
        totalFigurinhas: data.totalFigurinhas,
        figurinhasRepetidas: data.figurinhasRepetidas,
        timesCompletos: data.timesCompletos,
        totalTimes: data.totalTimes,
        totalJogadoresBase: data.totalJogadoresBase
      });
      
      setStats(data);
      console.log('9. Estado stats atualizado');
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
      console.log('10. Loading finalizado');
    }
  };

  const fetchRanking = async () => {
    console.log('11. Iniciando fetchRanking');
    try {
      setLoadingRanking(true);
      const response = await fetch('/api/ranking');
      if (!response.ok) throw new Error('Erro ao carregar ranking');
      const data = await response.json();
      setRankingData(data);
      console.log('12. Ranking atualizado');
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  if (loading) {
    console.log('13. Renderizando loading...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    console.log('14. Sem sessão, retornando null');
    return null;
  }

  console.log('15. Renderizando dashboard completo. Stats:', stats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Dashboard</h1>
        
        {stats && <UserStats stats={stats} />}

        {/* Seu Álbum */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-brasil-blue">Seu Álbum</h2>
          <div className="space-y-3 md:space-y-4">
            <Link href="/meu-album" className="block">
              <div className="flex items-center justify-between p-3 md:p-4 bg-brasil-green/10 rounded-lg hover:bg-brasil-green/20 transition-colors">
                <span className="text-sm md:text-base text-brasil-blue font-medium">Progresso do Álbum</span>
                <span className="text-sm md:text-base text-brasil-green font-bold">
                  {stats?.timesCompletos}/{stats?.totalTimes} times completos
                </span>
              </div>
            </Link>
            <Link href="/meu-album" className="block">
              <div className="flex items-center justify-between p-3 md:p-4 bg-brasil-blue/10 rounded-lg hover:bg-brasil-blue/20 transition-colors">
                <span className="text-sm md:text-base text-brasil-blue font-medium">Figurinhas Únicas</span>
                <span className="text-sm md:text-base text-brasil-blue font-bold">{stats?.totalFigurinhas}</span>
              </div>
            </Link>
            <Link href="/repetidas" className="block">
              <div className="flex items-center justify-between p-3 md:p-4 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                <span className="text-sm md:text-base text-brasil-blue font-medium">Figurinhas Repetidas</span>
                <span className="text-sm md:text-base text-red-600 font-bold">{stats?.figurinhasRepetidas}</span>
              </div>
            </Link>
          </div>
          {/* Quantidade de figurinhas por raridade - agora com destaque */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="rounded-lg shadow-md bg-purple-100 border-l-4 border-purple-600 flex flex-col items-center py-4">
              <span className="text-xs text-purple-700 font-semibold uppercase tracking-wider mb-1">Lendárias</span>
              <span className="text-3xl font-extrabold text-purple-700">{stats?.figurinhasLendarias ?? 0}</span>
            </div>
            <div className="rounded-lg shadow-md bg-yellow-100 border-l-4 border-yellow-500 flex flex-col items-center py-4">
              <span className="text-xs text-yellow-700 font-semibold uppercase tracking-wider mb-1">Ouro</span>
              <span className="text-3xl font-extrabold text-yellow-600">{stats?.figurinhasOuro ?? 0}</span>
            </div>
            <div className="rounded-lg shadow-md bg-gray-100 border-l-4 border-gray-400 flex flex-col items-center py-4">
              <span className="text-xs text-gray-700 font-semibold uppercase tracking-wider mb-1">Prata</span>
              <span className="text-3xl font-extrabold text-gray-600">{stats?.figurinhasPrata ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Ranking de Colecionadores */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-brasil-blue">Ranking de Colecionadores</h2>
          {loadingRanking ? (
            <p className="text-gray-500">Carregando ranking...</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {rankingData?.ranking.map((item, index) => (
                <div
                  key={item.email}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-lg ${
                    item.email === session.user?.email
                      ? 'bg-brasil-green/20'
                      : 'bg-white/50'
                  }`}
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
                      <span className="text-sm md:text-base text-gray-400 font-medium">{item.posicao}º</span>
                    )}
                    <span className={`text-sm md:text-base font-medium ${
                      item.email === session.user?.email ? 'text-brasil-blue font-bold' : 'text-gray-700'
                    }`}>
                      {item.nome}
                    </span>
                  </div>
                  <span className="text-sm md:text-base font-medium text-brasil-green">
                    {item.totalFigurinhas} figurinhas
                  </span>
                </div>
              ))}
              
              {/* Exibe a posição do usuário atual se ele não estiver no top 20 */}
              {rankingData?.usuarioAtual && !rankingData.ranking.find(item => item.email === session.user?.email) && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-brasil-green/20">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <span className="text-sm md:text-base text-gray-400 font-medium">
                        {rankingData.usuarioAtual.posicao}º
                      </span>
                      <span className="text-sm md:text-base font-bold text-brasil-blue">
                        {rankingData.usuarioAtual.nome} (Você)
                      </span>
                    </div>
                    <span className="text-sm md:text-base font-medium text-brasil-green">
                      {rankingData.usuarioAtual.totalFigurinhas} figurinhas
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 