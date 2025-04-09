'use client';

import type { UserStats } from '@/types/stats';

interface UserStatsProps {
  stats: UserStats;
}

export default function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Pacotes</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.totalPacotes}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Figurinhas</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.totalFigurinhas}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Figurinhas Repetidas</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.figurinhasRepetidas}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Times Completos</h3>
        <p className="text-3xl font-bold text-purple-600">
          {stats.timesCompletos}/{stats.totalTimes}
        </p>
      </div>
    </div>
  );
} 