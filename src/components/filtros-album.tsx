import { Filtros } from '@/types/filtros';

interface FiltrosAlbumProps {
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
}

export function FiltrosAlbum({ filtros, onFiltrosChange }: FiltrosAlbumProps) {
  const handleChange = (campo: keyof Filtros, valor: string) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posição
          </label>
          <select
            value={filtros.posicao}
            onChange={(e) => handleChange('posicao', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas</option>
            <option value="Goleiro">Goleiro</option>
            <option value="Zagueiro">Zagueiro</option>
            <option value="Lateral">Lateral</option>
            <option value="Meio-campo">Meio-campo</option>
            <option value="Atacante">Atacante</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <select
            value={filtros.time}
            onChange={(e) => handleChange('time', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="Flamengo">Flamengo</option>
            <option value="Palmeiras">Palmeiras</option>
            <option value="Atlético-MG">Atlético-MG</option>
            <option value="Corinthians">Corinthians</option>
            <option value="São Paulo">São Paulo</option>
            <option value="Santos">Santos</option>
            <option value="Grêmio">Grêmio</option>
            <option value="Internacional">Internacional</option>
            <option value="Fluminense">Fluminense</option>
            <option value="Botafogo">Botafogo</option>
            <option value="Vasco">Vasco</option>
            <option value="Cruzeiro">Cruzeiro</option>
            <option value="Athletico-PR">Athletico-PR</option>
            <option value="Bahia">Bahia</option>
            <option value="Fortaleza">Fortaleza</option>
            <option value="Ceará">Ceará</option>
            <option value="Sport">Sport</option>
            <option value="Goiás">Goiás</option>
            <option value="Coritiba">Coritiba</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nacionalidade
          </label>
          <select
            value={filtros.nacionalidade}
            onChange={(e) => handleChange('nacionalidade', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas</option>
            <option value="Brasileiro">Brasileiro</option>
            <option value="Argentino">Argentino</option>
            <option value="Uruguaio">Uruguaio</option>
            <option value="Colombiano">Colombiano</option>
            <option value="Chileno">Chileno</option>
            <option value="Paraguaio">Paraguaio</option>
            <option value="Venezuelano">Venezuelano</option>
            <option value="Peruano">Peruano</option>
            <option value="Equatoriano">Equatoriano</option>
            <option value="Boliviano">Boliviano</option>
          </select>
        </div>
      </div>
    </div>
  );
} 