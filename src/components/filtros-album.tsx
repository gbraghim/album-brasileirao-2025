'use client';

import { Filtros } from '@/types/filtros';

interface FiltrosAlbumProps {
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
}

export default function FiltrosAlbum({ filtros, onFiltrosChange }: FiltrosAlbumProps) {
  const handleChange = (campo: keyof Filtros, valor: string) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time
        </label>
        <select
          value={filtros.time}
          onChange={(e) => handleChange('time', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos os times</option>
          <option value="América-MG">América-MG</option>
          <option value="Athletico-PR">Athletico-PR</option>
          <option value="Atlético-MG">Atlético-MG</option>
          <option value="Bahia">Bahia</option>
          <option value="Botafogo">Botafogo</option>
          <option value="Corinthians">Corinthians</option>
          <option value="Coritiba">Coritiba</option>
          <option value="Cruzeiro">Cruzeiro</option>
          <option value="Cuiabá">Cuiabá</option>
          <option value="Flamengo">Flamengo</option>
          <option value="Fluminense">Fluminense</option>
          <option value="Fortaleza">Fortaleza</option>
          <option value="Goiás">Goiás</option>
          <option value="Grêmio">Grêmio</option>
          <option value="Internacional">Internacional</option>
          <option value="Palmeiras">Palmeiras</option>
          <option value="Red Bull Bragantino">Red Bull Bragantino</option>
          <option value="Santos">Santos</option>
          <option value="São Paulo">São Paulo</option>
          <option value="Vasco">Vasco</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Posição
        </label>
        <select
          value={filtros.posicao}
          onChange={(e) => handleChange('posicao', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas as posições</option>
          <option value="Goleiro">Goleiro</option>
          <option value="Zagueiro">Zagueiro</option>
          <option value="Lateral">Lateral</option>
          <option value="Meio-campo">Meio-campo</option>
          <option value="Atacante">Atacante</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Raridade
        </label>
        <select
          value={filtros.raridade}
          onChange={(e) => handleChange('raridade', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas as raridades</option>
          <option value="COMUM">Comum</option>
          <option value="RARO">Raro</option>
          <option value="SUPER_RARO">Super Raro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar
        </label>
        <input
          type="text"
          value={filtros.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Digite para buscar..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
} 