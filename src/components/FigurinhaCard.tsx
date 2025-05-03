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
  onAdicionarRepetida,
  hideName = false
}: FigurinhaCardProps) {
  const [currentPath, setCurrentPath] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);
  const caminhos = formatarCaminhoImagem(jogador.time.nome, jogador.nome);

  const handleImageError = () => {
    setImageError(true);
    if (onImageError) {
      onImageError();
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!imageError && caminhos[0]) {
      getCachedImage(caminhos[0]).then(base64 => {
        if (isMounted) setCachedSrc(base64);
      }).catch(() => setCachedSrc(null));
    }
    return () => { isMounted = false; };
  }, [caminhos, imageError]);

  // LOG DE DEBUG PARA DEPURAÇÃO
  // console.log('DEBUG jogador:', {
  //   timeNome: jogador.time?.nome,
  //   jogadorNome: jogador.nome,
  //   s3Url: getS3PlayerUrl(jogador.time?.nome, jogador.nome)
  // });

  return (
    <div className={`relative group`}>
      <div className={`relative w-32 h-48 rounded-lg border-4 ${getRaridadeStyle(jogador.raridade)} shadow-lg overflow-hidden bg-gradient-to-br transition-all duration-300 hover:scale-105 ${!jogadorColetado ? 'filter-none' : ''}`}>
        <div className="relative w-full h-full">
          <Image
            src={imageError ? '/placeholder.jpg' : (cachedSrc || caminhos[0])}
            alt={jogador.nome}
            fill
            className="object-cover"
            onError={handleImageError}
          />
          {!jogadorColetado && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
              <a
                href="/pacotes"
                className="flex flex-col items-center justify-center gap-2 bg-white/90 hover:bg-brasil-green/90 hover:text-white text-brasil-blue px-6 py-4 rounded-full text-lg font-bold shadow-lg transition-colors duration-200 border-2 border-brasil-green/60"
                style={{zIndex:11}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-brasil-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
                Colecionar
              </a>
            </div>
          )}
        </div>
        {jogadorColetado && !hideName && (
          <div className="absolute bottom-0 left-0 right-0 p-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-center text-brasil-blue truncate">
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
          <button
            onClick={() => onAdicionarRepetida(jogador)}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-brasil-green text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md hover:bg-brasil-green-dark transition-colors"
          >
            Adicionar
          </button>
        )}
      </div>
    </div>
  );
} 