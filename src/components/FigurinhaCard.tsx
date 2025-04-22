import { Jogador } from '../types/jogador';

interface FigurinhaCardProps {
  jogador: {
    id: string;
    nome: string;
    numero: number | null;
    posicao: string | null;
    nacionalidade: string | null;
    foto: string | null;
    time: {
      id: string;
      nome: string;
      escudo: string | null;
    };
    quantidade: number;
  };
  onAdicionarRepetida: (jogador: Jogador) => void;
}

export default function FigurinhaCard({ jogador, onAdicionarRepetida }: FigurinhaCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={jogador.foto || '/placeholder.png'}
            alt={jogador.nome}
            className="w-16 h-16 object-cover rounded-full"
          />
          <div>
            <h3 className="font-bold">{jogador.nome}</h3>
            <p className="text-sm text-gray-600">#{jogador.numero || 'N/A'}</p>
            <p className="text-sm text-gray-600">{jogador.posicao || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">x{jogador.quantidade}</span>
          <button
            onClick={() => onAdicionarRepetida(jogador)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
} 