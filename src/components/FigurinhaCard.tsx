import Image from 'next/image';
import { useState, useEffect } from 'react';
import { formatarCaminhoImagem, getS3EscudoUrl } from '@/lib/utils';
import { getCachedImage } from '@/lib/cache';

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
  hideName?: boolean;
  priority?: boolean;
}

export default function FigurinhaCard({ 
  jogador, 
  jogadorColetado, 
  currentImageIndex = 0, 
  onImageError,
  onAdicionarRepetida,
  hideName = false,
  priority = false
}: FigurinhaCardProps) {
  const [currentPath, setCurrentPath] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  // Função para obter a imagem baseada na raridade
  const getRaridadeImage = (raridade: string) => {
    switch (raridade) {
      case 'Lendário':
        return '/raridadeLendario.png';
      case 'Ouro':
        return '/raridadeOuro.png';
      case 'Prata':
        return '/raridadePrata.png';
      default:
        return '/raridadePrata.png';
    }
  };

  // Função para definir o estilo da borda baseado na raridade
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

  const handleImageError = () => {
    setImageError(true);
    onImageError();
  };

  return (
    <div className={`relative group`}>
      <div className={`relative w-32 h-48 rounded-lg border-4 ${getRaridadeStyle(jogador.raridade)} shadow-lg overflow-hidden bg-gradient-to-br transition-all duration-300 hover:scale-105 ${!jogadorColetado ? 'filter-none' : ''}`}>
        <div className="relative w-full h-full">
          {jogadorColetado ? (
            <Image
              src={getRaridadeImage(jogador.raridade)}
              alt={jogador.nome}
              fill
              className="object-contain p-4"
              onError={handleImageError}
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              sizes="(max-width: 128px) 100vw, 128px"
              quality={75}
            />
          ) : (
            <div className="absolute inset-0 bg-black/70 z-10 backdrop-blur-sm" />
          )}
        </div>
        {!hideName && (
          <div className="absolute bottom-0 left-0 right-0 p-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-center text-brasil-blue truncate" style={{zIndex: 20}}>
            {jogador.nome}
          </div>
        )}
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
        {!jogadorColetado && onAdicionarRepetida && (
          <a
            href="/pacotes"
            className="absolute inset-0 flex items-center justify-center z-30"
            title="Ir para compra de pacotes"
            style={{zIndex: 30, pointerEvents: 'auto'}}
          >
            <span
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border-2 border-white text-white text-base font-bold hover:scale-110 hover:shadow-xl transition-transform duration-200 max-w-[80%] w-auto
                ${jogador.raridade === 'Lendário' ? 'bg-gradient-to-br from-purple-600 to-purple-400' : ''}
                ${jogador.raridade === 'Ouro' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' : ''}
                ${jogador.raridade === 'Prata' ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' : ''}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Obter!
            </span>
          </a>
        )}
      </div>
    </div>
  );
} 