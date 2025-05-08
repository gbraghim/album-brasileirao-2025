'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import UserStats from '@/components/UserStats';
import type { UserStats as UserStatsType } from '@/types/stats';
import Image from 'next/image';

interface UserStats {
  totalFigurinhas: number;
  figurinhasRepetidas: number;
  totalPacotes: number;
  timesCompletos: number;
  totalTimes: number;
  totalJogadoresBase: number;
  figurinhasLendarias: number;
  figurinhasOuro: number;
  figurinhasPrata: number;
  timesDetalhados: Array<{
    nome: string;
    completo: boolean;
    figurinhasObtidas: number;
    totalFigurinhas: number;
  }>;
}

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
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [showMVPModal, setShowMVPModal] = useState(false);
  const [showTimesAccordion, setShowTimesAccordion] = useState(false);
  const timesDetalhados = stats?.timesDetalhados || [];
  const timesCompletos = timesDetalhados.filter((t: { completo: boolean }) => t.completo).sort((a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome));
  const timesIncompletos = timesDetalhados.filter((t: { completo: boolean }) => !t.completo).sort((a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome));
  const timesOrdenados = [...timesCompletos, ...timesIncompletos];

  useEffect(() => {
    console.log('3. useEffect executado - status:', status);
    
    if (status === 'authenticated') {
      console.log('4. Usuário autenticado, buscando dados...');
      // Carrega as estatísticas primeiro
      fetchStats();
    }
  }, [status]);

  // Carrega o ranking após as estatísticas serem carregadas
  useEffect(() => {
    if (!loadingStats && status === 'authenticated') {
      console.log('Carregando ranking após estatísticas...');
      fetchRanking();
    }
  }, [loadingStats, status]);

  const fetchStats = async () => {
    try {
      console.log('5. Iniciando fetchStats');
      console.log('6. Fazendo requisição para /api/stats');
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRanking = async () => {
    try {
      console.log('11. Iniciando fetchRanking');
      const response = await fetch('/api/ranking');
      if (!response.ok) {
        throw new Error('Erro ao buscar ranking');
      }
      const data = await response.json();
      setRankingData(data);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  if (status === 'loading' || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 flex flex-col items-center justify-center">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Álbum Brasileirão 2025"
            width={200}
            height={200}
            className="animate-pulse mb-8"
          />
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-brasil-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-brasil-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-brasil-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="mt-4 text-brasil-blue font-medium">Carregando seu álbum...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="mb-4">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login" className="text-blue-500 hover:underline">
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Dashboard</h1>
        
        {/* Seção de Estatísticas */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Minhas Estatísticas</h2>
          {loadingStats ? (
            <div className="flex justify-center items-center space-x-2">
              <div className="w-3 h-3 bg-brasil-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-brasil-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-brasil-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800">Total de Figurinhas</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalFigurinhas}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">Figurinhas Repetidas</h3>
                <p className="text-3xl font-bold text-green-600">{stats.figurinhasRepetidas}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800">Pacotes Abertos</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalPacotes}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Erro ao carregar estatísticas</p>
          )}
        </div>

        {/* Seu Álbum */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-brasil-blue">Seu Álbum</h2>
          <div className="space-y-3 md:space-y-4">
            {/* Progresso do Álbum com accordeon */}
            <div className="block">
              <button
                type="button"
                className="w-full flex items-center justify-between p-3 md:p-4 bg-brasil-green/10 rounded-lg hover:bg-brasil-green/20 transition-colors focus:outline-none"
                onClick={() => setShowTimesAccordion((v) => !v)}
              >
                <span className="text-sm md:text-base text-brasil-blue font-medium">Progresso do Álbum</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm md:text-base text-brasil-green font-bold">
                    {stats?.timesCompletos}/{stats?.totalTimes} times completos
                  </span>
                  <svg className={`w-5 h-5 ml-2 transition-transform ${showTimesAccordion ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              {showTimesAccordion && (
                <div className="bg-white rounded-lg shadow-inner mt-2 p-2 max-h-96 overflow-y-auto border border-brasil-green/30">
                  <ul>
                    {timesOrdenados.map((time) => (
                      <li key={time.nome} className="flex items-center gap-2 py-1 px-2">
                        {time.completo ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        <span className={time.completo ? 'text-green-700 font-semibold' : 'text-black'}>
                          {time.nome} ({time.figurinhasObtidas}/{time.totalFigurinhas})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
            <div className="flex justify-center items-center space-x-2">
              <div className="w-3 h-3 bg-brasil-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-brasil-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-brasil-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {rankingData?.ranking.map((item, index) => (
                <div
                  key={item.email}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-lg ${
                    item.email === session?.user?.email
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
                      item.email === session?.user?.email ? 'text-brasil-blue font-bold' : 'text-gray-700'
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
              {rankingData?.usuarioAtual && !rankingData.ranking.find(item => item.email === session?.user?.email) && (
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