import Image from 'next/image';
import { formatarCaminhoImagem, getS3EscudoUrl } from '@/lib/utils';
import { getCachedImage } from '@/lib/cache';
import { useState, useEffect } from 'react';

interface CardJogadorProps {
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
  };
  quantidade: number;
  className?: string;
  raridade: string;
}

export default function CardJogador({ jogador, quantidade, className, raridade }: CardJogadorProps) {
  const [cachedEscudo, setCachedEscudo] = useState<string | null>(null);

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

  // Função para obter o estilo baseado na raridade
  const getRaridadeStyle = (raridade: string) => {
    switch (raridade) {
      case 'Lendário':
        return 'border-4 border-purple-600';
      case 'Ouro':
        return 'border-4 border-yellow-500';
      case 'Prata':
        return 'border-4 border-gray-400';
      default:
        return 'border-4 border-gray-400';
    }
  };

  useEffect(() => {
    let isMounted = true;
    getCachedImage(getS3EscudoUrl(jogador.time.escudo)).then(base64 => {
      if (isMounted) setCachedEscudo(base64);
    }).catch(() => setCachedEscudo(null));
    return () => { isMounted = false; };
  }, [jogador.time.escudo]);

  return (
    <div className={`relative ${className}`}>
      <div className={`relative w-full h-full rounded-lg overflow-hidden ${getRaridadeStyle(raridade)}`}>
        <Image
          src={getRaridadeImage(raridade)}
          alt={jogador.nome}
          fill
          className="object-contain p-2"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs text-center">
          {jogador.nome}
        </div>
      </div>
    </div>
  );
} 