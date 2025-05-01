import Image from 'next/image';
import { useState } from 'react';
import { formatarCaminhoImagem, getS3PlayerUrl, getS3EscudoUrl } from '@/lib/utils';

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
  currentImageIndex = 0, 
  onImageError,
  onAdicionarRepetida 
}: FigurinhaCardProps) {
  const [currentPath, setCurrentPath] = useState(0);
  const [imageError, setImageError] = useState(false);
  const caminhos = formatarCaminhoImagem(jogador.time.nome, jogador.nome);
  const s3Url = getS3PlayerUrl(jogador.time.nome, jogador.nome);

  const handleImageError = () => {
    setImageError(true);
    if (onImageError) {
      onImageError();
    }
  };

  // LOG DE DEBUG PARA DEPURAÇÃO
  // console.log('DEBUG jogador:', {
  //   timeNome: jogador.time?.nome,
  //   jogadorNome: jogador.nome,
  //   s3Url: getS3PlayerUrl(jogador.time?.nome, jogador.nome)
  // });

  return (
    <div className="relative group">
      <div className={`relative w-32 h-48 rounded-lg border-4 ${getRaridadeStyle(jogador.raridade)} shadow-lg overflow-hidden bg-gradient-to-br transition-all duration-300 hover:scale-105 ${!jogadorColetado ? 'filter blur-md' : ''}`}>
        <div className="relative w-full h-40">
          <Image
            src={imageError ? '/placeholder.jpg' : s3Url}
            alt={jogador.nome}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        </div>
        <div className="p-1 bg-white/90 backdrop-blur-sm">
          <p className="text-sm font-bold text-center text-black truncate">{jogador.nome}</p>
          <p className="text-xs text-center text-black truncate">{jogador.posicao}</p>
        </div>
        <div className="absolute top-1 right-1">
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            jogador.raridade === 'Lendário'
              ? 'bg-purple-600/80 text-white'
              : jogador.raridade === 'Ouro'
                ? 'bg-yellow-500/80 text-black'
                : jogador.raridade === 'Prata'
                  ? 'bg-gray-400/80 text-black'
                  : 'bg-gray-400/80 text-black'
          }`}>
            {jogador.raridade}
          </div>
        </div>
      </div>
      {!jogadorColetado && onAdicionarRepetida && (
        <button
          onClick={() => onAdicionarRepetida(jogador)}
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-brasil-green text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md hover:bg-brasil-green-dark transition-colors"
        >
          Adicionar
        </button>
      )}
    </div>
  );
} 