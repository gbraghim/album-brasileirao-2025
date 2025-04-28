import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';

interface FigurinhaCardProps {
  jogador: {
    id: string;
    nome: string;
    numero: number;
    posicao: string;
    nacionalidade: string;
    time: {
      id: string;
      nome: string;
      escudo: string;
    };
    raridade: string;
    quantidade?: number;
  };
  jogadorColetado: boolean;
  currentImageIndex: number;
  onImageError: () => void;
  onAdicionarRepetida?: (jogador: any) => void;
}

const getRaridadeStyle = (raridade: string) => {
  switch (raridade) {
    case 'Lendário':
      return 'border-purple-600 shadow-purple-600 bg-gradient-to-br from-purple-600/20 to-purple-900/20';
    case 'Ouro':
      return 'border-yellow-500 shadow-yellow-500 bg-gradient-to-br from-yellow-500/20 to-yellow-700/20';
    case 'Prata':
      return 'border-gray-400 shadow-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-600/20';
    default:
      return 'border-gray-400 shadow-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-600/20';
  }
};

export default function FigurinhaCard({ 
  jogador, 
  jogadorColetado, 
  currentImageIndex, 
  onImageError,
  onAdicionarRepetida 
}: FigurinhaCardProps) {
  const caminhos = formatarCaminhoImagem(jogador.time.nome, jogador.nome);
  const currentPath = caminhos[currentImageIndex];

  return (
    <div className={`relative group ${!jogadorColetado ? 'blur-md' : ''}`}>
      <div className={`relative w-32 h-48 rounded-lg border-4 ${getRaridadeStyle(jogador.raridade)} shadow-lg overflow-hidden transition-all duration-300 hover:scale-105`}>
        {/* Imagem do jogador */}
        <div className="relative w-full h-40">
          <Image
            src={currentPath}
            alt={jogador.nome}
            fill
            className="object-cover"
            onError={onImageError}
          />
        </div>

        {/* Informações do jogador */}
        <div className="p-1 bg-white/90 backdrop-blur-sm">
          <p className="text-sm font-bold text-center text-black truncate">{jogador.nome}</p>
          <p className="text-xs text-center text-black truncate">{jogador.posicao}</p>
        </div>

        {/* Indicador de raridade */}
        {jogador.raridade !== 'Prata' && (
          <div className="absolute top-1 right-1">
            <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              jogador.raridade === 'Lendário' ? 'bg-purple-600/80 text-white' :
              jogador.raridade === 'Ouro' ? 'bg-yellow-500/80 text-black' :
              'bg-gray-400/80 text-black'
            }`}>
              {jogador.raridade}
            </div>
          </div>
        )}
      </div>
      {jogador.quantidade && jogador.quantidade > 1 && onAdicionarRepetida && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">x{jogador.quantidade}</span>
            <button
              onClick={() => onAdicionarRepetida(jogador)}
              className="text-blue-500 hover:text-blue-700"
            >
              Adicionar repetida
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 