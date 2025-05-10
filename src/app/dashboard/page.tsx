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

  // Função para agrupar usuários empatados
  function agruparPorFigurinhas(ranking: RankingItem[] | undefined) {
    if (!ranking) return [];
    const grupos = [];
    let posicao = 1;
    let i = 0;
    while (i < ranking.length && grupos.length < 10) {
      const grupo = ranking.filter((u: RankingItem) => u.totalFigurinhas === ranking[i].totalFigurinhas);
      grupos.push({ posicao, usuarios: grupo });
      i += grupo.length;
      posicao += grupo.length;
    }
    return grupos;
  }
  const gruposRanking = agruparPorFigurinhas(rankingData?.ranking);

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
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Seja bem-vindo, {session?.user?.name}!</h1>
        
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
                <h3 className="text-lg font-medium text-purple-800">Pacotes Obtidos</h3>
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
            <>
              {/* Top 3 em destaque */}
              <div className="flex flex-col sm:flex-row justify-center items-end gap-2 md:gap-4 mb-6">
                {gruposRanking.slice(0, 3).map((grupo, idx) => (
                  <div key={grupo.posicao} className={`flex flex-col items-center justify-end bg-white rounded-2xl shadow-xl border-4 transition-all duration-200 px-2 py-3 md:py-4 w-full sm:w-40 md:w-48
                    ${idx === 0 ? 'border-yellow-400 z-20 scale-105 ring-4 ring-yellow-300 ring-opacity-60 shadow-[0_0_32px_8px_rgba(255,215,0,0.25)]' : ''}
                    ${idx === 1 ? 'border-gray-400 z-10 scale-100' : ''}
                    ${idx === 2 ? 'border-amber-600 z-10 scale-102' : ''}
                  `}
                  style={{ marginTop: idx === 0 ? '-1rem' : '0', background: idx === 0 ? 'linear-gradient(135deg, #fffbe6 60%, #fffde4 100%)' : idx === 1 ? 'linear-gradient(135deg, #f3f4f6 60%, #e5e7eb 100%)' : 'linear-gradient(135deg, #fff8e1 60%, #ffecb3 100%)' }}
                  >
                    {/* Medalha */}
                    <div className="mb-1">
                      {idx === 0 && <span className="inline-block text-3xl">🥇</span>}
                      {idx === 1 && <span className="inline-block text-3xl">🥈</span>}
                      {idx === 2 && <span className="inline-block text-3xl">🥉</span>}
                    </div>
                    <span className="text-xs text-gray-500 mb-1">{grupo.posicao}º lugar</span>
                    <div className="flex flex-col items-center mb-1">
                      {grupo.usuarios.map((item: RankingItem) => (
                        <span key={item.email} className="text-base md:text-lg font-extrabold text-brasil-blue text-center">{item.nome}</span>
                      ))}
                      <span className="text-sm md:text-base font-semibold text-brasil-green mt-1">{grupo.usuarios[0]?.totalFigurinhas} figurinhas</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Demais posições */}
              <div className="space-y-2 md:space-y-3">
                {gruposRanking.slice(3, 10).map((grupo) => (
                  <div key={grupo.posicao} className="flex flex-col bg-white/60 shadow border-l-4 border-brasil-blue rounded-lg p-2 md:p-4 mb-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-400 w-8 text-center">{grupo.posicao}º</span>
                      {grupo.usuarios.map((item: RankingItem) => (
                        <span key={item.email} className={`text-base md:text-lg font-medium mr-4 ${item.email === session?.user?.email ? 'text-brasil-blue font-bold' : 'text-gray-700'}`}>{item.nome}</span>
                      ))}
                      <span className="text-sm md:text-base font-semibold text-brasil-green ml-2">{grupo.usuarios[0]?.totalFigurinhas} figurinhas</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 