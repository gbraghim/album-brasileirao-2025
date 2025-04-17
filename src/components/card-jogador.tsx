import { Jogador } from '@/types/jogador';

interface CardJogadorProps {
  jogador: Jogador;
  quantidade: number;
}

export function CardJogador({ jogador, quantidade }: CardJogadorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <img
            src={jogador.time.escudo}
            alt={jogador.time.nome}
            className="w-8 h-8 object-contain"
          />
          <span className="text-sm text-gray-600">#{jogador.numero}</span>
        </div>

        <div className="flex justify-center mb-4">
          <img
            src={jogador.foto}
            alt={jogador.nome}
            className="w-32 h-32 object-cover rounded-full"
          />
        </div>

        <div className="text-center">
          <h3 className="font-bold text-lg mb-1">{jogador.nome}</h3>
          <p className="text-sm text-gray-600 mb-1">{jogador.posicao}</p>
          <p className="text-sm text-gray-600 mb-2">{jogador.nacionalidade}</p>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block">
            x{quantidade}
          </div>
        </div>
      </div>
    </div>
  );
} 