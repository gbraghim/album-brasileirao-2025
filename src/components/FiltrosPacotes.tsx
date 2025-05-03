import { FiltrosPacotesProps } from '@/types/filtros';

export default function FiltrosPacotes({ pacotes, filtros, setFiltros }: FiltrosPacotesProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <select
          value={filtros.time}
          onChange={(e) => setFiltros({ ...filtros, time: e.target.value })}
          className="px-4 py-2 pr-10 rounded-lg bg-white border-2 border-brasil-blue focus:ring-2 focus:ring-brasil-blue focus:border-brasil-blue outline-none transition-all duration-150 shadow-sm cursor-pointer appearance-none relative font-semibold text-brasil-blue"
          style={{ minWidth: 180 }}
        >
          <option value="">Todos os times</option>
          {/* Adicione as opções de times aqui */}
        </select>
        <svg
          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 8L10 12L14 8" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

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