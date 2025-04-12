import { FiltrosPacotesProps } from '@/types/filtros';

export default function FiltrosPacotes({ pacotes, filtros, setFiltros }: FiltrosPacotesProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        value={filtros.time}
        onChange={(e) => setFiltros({ ...filtros, time: e.target.value })}
        className="px-4 py-2 rounded-lg bg-white border border-gray-300"
      >
        <option value="">Todos os times</option>
        {/* Adicione as opções de times aqui */}
      </select>

      <select
        value={filtros.posicao}
        onChange={(e) => setFiltros({ ...filtros, posicao: e.target.value })}
        className="px-4 py-2 rounded-lg bg-white border border-gray-300"
      >
        <option value="">Todas as posições</option>
        {/* Adicione as opções de posições aqui */}
      </select>

      <select
        value={filtros.raridade}
        onChange={(e) => setFiltros({ ...filtros, raridade: e.target.value })}
        className="px-4 py-2 rounded-lg bg-white border border-gray-300"
      >
        <option value="">Todas as raridades</option>
        {/* Adicione as opções de raridades aqui */}
      </select>

      <input
        type="text"
        value={filtros.search}
        onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
        placeholder="Buscar..."
        className="px-4 py-2 rounded-lg bg-white border border-gray-300"
      />
    </div>
  );
} 