'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import UserStats from '@/components/UserStats';
import type { UserStats as UserStatsType } from '@/types/stats';
import Image from 'next/image';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import useSWR from 'swr';

export const dynamic = 'force-dynamic';

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
  totalUsuarios: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showMVPModal, setShowMVPModal] = useState(false);
  const [showTimesAccordion, setShowTimesAccordion] = useState(false);
  const [showLegalNotice, setShowLegalNotice] = useState(true);

  // SWR para buscar stats
  const { data: stats, error, isLoading } = useSWR<UserStats>('/api/stats', fetcher, { revalidateOnFocus: false });

  // Memoização das listas derivadas
  const timesDetalhados = stats?.timesDetalhados || [];
  const timesCompletos = useMemo(() =>
    timesDetalhados.filter(t => t.completo).sort((a, b) => a.nome.localeCompare(b.nome)), [timesDetalhados]);
  const timesIncompletos = useMemo(() =>
    timesDetalhados.filter(t => !t.completo).sort((a, b) => a.nome.localeCompare(b.nome)), [timesDetalhados]);
  const timesOrdenados = useMemo(() =>
    [...timesCompletos, ...timesIncompletos], [timesCompletos, timesIncompletos]);

  // Modal de aviso legal
  const handleCloseNotice = () => {
    setShowLegalNotice(false);
  };

  // Calcular corretamente o total de figurinhas para exibição
  const totalFigurinhasExibido = stats ? (stats.totalFigurinhas + stats.figurinhasRepetidas) : 0;

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 flex flex-col items-center justify-center">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Álbum Brasileirão 2025"
            width={200}
            height={200}
            className="animate-pulse mb-8"
            priority
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
      {/* Modal de Aviso Legal */}
      {showLegalNotice && (
        <Modal
          isOpen={showLegalNotice}
          onClose={handleCloseNotice}
          title="Bem-vindo ao Álbum Virtual!"
        >
          <div className="text-center py-4 md:py-6 bg-white rounded-lg">
            <div className="mb-4 md:mb-6 px-4 md:px-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 text-brasil-blue mx-auto mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg md:text-xl font-bold text-brasil-blue mb-3 md:mb-4">Aviso Importante</h3>
              <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
                Para garantir uma experiência legal e divertida, estamos usando representações genéricas dos jogadores em nosso álbum virtual. Isso não diminui em nada a diversão e o desafio de completar sua coleção!
              </p>
              <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
                O verdadeiro espírito do álbum está em:
              </p>
              <ul className="text-left text-sm md:text-base text-gray-700 mb-4 md:mb-6 space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-brasil-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Colecionar todas as figurinhas
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-brasil-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Trocar com outros colecionadores
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-brasil-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Completar seu álbum virtual
                </li>
              </ul>
              <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
                A emoção de encontrar uma figurinha rara, a alegria de completar uma página e a satisfação de ajudar outros colecionadores continuam as mesmas! Vamos juntos nessa jornada de colecionador?
              </p>
              <button
                onClick={handleCloseNotice}
                className="w-full md:w-auto bg-brasil-blue hover:bg-brasil-blue/90 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base"
              >
                Entendi! Vamos começar!
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Seja bem-vindo, {session?.user?.name}!</h1>
        
        {/* Seção de Estatísticas */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Minhas Estatísticas</h2>
          {isLoading ? (
            <div className="flex justify-center items-center space-x-2">
              <div className="w-3 h-3 bg-brasil-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-brasil-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-brasil-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800">Total de Figurinhas</h3>
                <p className="text-3xl font-bold text-blue-600">{totalFigurinhasExibido}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">Figurinhas Repetidas</h3>
                <p className="text-3xl font-bold text-green-600">{stats.figurinhasRepetidas}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800">Pacotes Obtidos</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalPacotes}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-800">Total de Usuários</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalUsuarios}</p>
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
      </div>
    </div>
  );
} 