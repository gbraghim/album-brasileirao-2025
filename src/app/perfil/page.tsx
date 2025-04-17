'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { User } from '@prisma/client';

export default function PerfilPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUser(data);
      }
    };

    fetchUser();
  }, [session]);

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.email) {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      }
    };

    fetchStats();
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
       
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Acesso Negado
          </h2>
          <p className="text-center text-gray-600">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Meu Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Informações do Usuário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-brasil-blue">Informações Pessoais</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-3 md:space-x-4">
                <img
                  src={session?.user?.image || '/default-avatar.png'}
                  alt={session?.user?.name || 'Avatar'}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full"
                />
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-brasil-blue">{session?.user?.name}</h3>
                  <p className="text-sm md:text-base text-gray-600">{session?.user?.email}</p>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between p-3 md:p-4 bg-brasil-green/10 rounded-lg">
                  <span className="text-sm md:text-base text-brasil-blue font-medium">Data de Cadastro</span>
                  <span className="text-sm md:text-base text-brasil-green font-bold">
                    {new Date(session?.user?.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-brasil-yellow/10 rounded-lg">
                  <span className="text-sm md:text-base text-brasil-blue font-medium">Total de Figurinhas</span>
                  <span className="text-sm md:text-base text-brasil-yellow font-bold">{stats?.totalFigurinhas}</span>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-red-100 rounded-lg">
                  <span className="text-sm md:text-base text-brasil-blue font-medium">Figurinhas Repetidas</span>
                  <span className="text-sm md:text-base text-red-600 font-bold">{stats?.figurinhasRepetidas}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-brasil-blue">Estatísticas</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-brasil-green/10 p-3 md:p-4 rounded-lg">
                  <h3 className="text-sm md:text-base font-medium text-brasil-blue mb-1">Times Completos</h3>
                  <p className="text-2xl md:text-3xl font-bold text-brasil-green">
                    {stats?.timesCompletos}/{stats?.totalTimes}
                  </p>
                </div>
                <div className="bg-brasil-yellow/10 p-3 md:p-4 rounded-lg">
                  <h3 className="text-sm md:text-base font-medium text-brasil-blue mb-1">Pacotes Abertos</h3>
                  <p className="text-2xl md:text-3xl font-bold text-brasil-yellow">{stats?.totalPacotes}</p>
                </div>
              </div>

              <div className="bg-white/50 p-3 md:p-4 rounded-lg">
                <h3 className="text-sm md:text-base font-medium text-brasil-blue mb-2">Progresso do Álbum</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 md:h-3">
                  <div
                    className="bg-brasil-green h-2.5 md:h-3 rounded-full"
                    style={{
                      width: `${((stats?.totalFigurinhas || 0) / (stats?.totalJogadores || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm md:text-base text-brasil-green mt-2">
                  {stats?.totalFigurinhas} de {stats?.totalJogadores} figurinhas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 