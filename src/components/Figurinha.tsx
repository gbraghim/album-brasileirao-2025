'use client';

import { useState } from 'react';
import { Figurinha as FigurinhaType } from '@prisma/client';
import { CloudinaryImage } from '@/lib/cloudinary';

interface FigurinhaProps {
  figurinha: FigurinhaType & {
    jogador: {
      id: string;
      nome: string;
    };
  };
  onClick?: () => void;
  className?: string;
}

export default function Figurinha({ figurinha, onClick, className = '' }: FigurinhaProps) {
  const [isLoading, setIsLoading] = useState(true);

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
        <CloudinaryImage
          src={`album-brasileirao/players/${figurinha.jogador.id}`}
          alt={figurinha.jogador.nome}
          width={128}
          height={192}
        />
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-900">{figurinha.jogador.nome}</p>
        <p className="text-xs text-gray-500">{figurinha.time}</p>
      </div>
    </div>
  );
} 