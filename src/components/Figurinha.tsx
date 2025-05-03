'use client';

import { useState, useEffect } from 'react';
import { Figurinha as FigurinhaType } from '@prisma/client';
import Image from 'next/image';
import { getCachedImage } from '@/lib/cache';

interface FigurinhaProps {
  figurinha: FigurinhaType & {
    jogador: {
      id: string;
      nome: string;
      time: string;
    } | null;
  };
  onClick?: () => void;
  className?: string;
}

export default function Figurinha({ figurinha, onClick, className = '' }: FigurinhaProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (figurinha.jogador) {
      const s3Url = `/players/${figurinha.jogador.id}.jpg`;
      getCachedImage(s3Url).then(base64 => {
        if (isMounted) setCachedSrc(base64);
      }).catch(() => setCachedSrc(null));
    }
    return () => { isMounted = false; };
  }, [figurinha.jogador?.id]);

  if (!figurinha.jogador) {
    console.warn('Figurinha sem jogador:', figurinha);
    return null;
  }

  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="relative w-32 h-48 bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {figurinha.jogador && (
          <Image
            src={cachedSrc || `/players/${figurinha.jogador.id}.jpg`}
            alt={figurinha.jogador.nome}
            width={128}
            height={192}
            className="rounded-lg shadow-md"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-900">{figurinha.jogador.nome}</p>
        <p className="text-xs text-gray-500">{figurinha.jogador.time}</p>
      </div>
    </div>
  );
} 