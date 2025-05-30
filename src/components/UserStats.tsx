'use client';

import Link from 'next/link';
import type { UserStats } from '@/types/stats';

interface UserStatsProps {
  stats: UserStats;
}

export default function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Link href="/pacotes" className="block">
        <div className="bg-white rounded-lg shadow-lg p-6 h-32 hover:bg-gray-50 transition-colors cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Total de Pacotes</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalPacotes}</p>
        </div>
      </Link>
      
      <Link href="/meu-album" className="block">
        <div className="bg-white rounded-lg shadow-lg p-6 h-32 hover:bg-gray-50 transition-colors cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Total de Jogadores Colecionados</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.totalFigurinhas}/{stats.totalJogadoresBase}
          </p>
        </div>
      </Link>

      <Link href="/meu-album" className="block">
        <div className="bg-white rounded-lg shadow-lg p-6 h-32 hover:bg-gray-50 transition-colors cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Times Completos</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.timesCompletos}/{stats.totalTimes}
          </p>
        </div>
      </Link>

      </div>
  );
} 