'use client';

import { useState } from 'react';
import { Figurinha as FigurinhaType } from '@prisma/client';
import Image from 'next/image';

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
  coletada?: boolean;
}

export default function Figurinha({ figurinha, onClick, className = '', coletada = false }: FigurinhaProps) {
  const [isLoading, setIsLoading] = useState(true);

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
        <div className={`relative ${!coletada ? 'grayscale opacity-50' : ''}`}>
          <Image
            src={`/players/${figurinha.jogador.id}.jpg`}
            alt={figurinha.jogador.nome}
            width={128}
            height={192}
            onLoad={() => setIsLoading(false)}
          />
          {!coletada && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <span className="text-white text-sm font-bold">Não coletada</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-900">{figurinha.jogador.nome}</p>
        <p className="text-xs text-gray-500">{figurinha.jogador.time}</p>
      </div>
    </div>
  );
} 