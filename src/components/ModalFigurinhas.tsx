import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatarCaminhoImagem, getS3EscudoUrl } from '@/lib/utils';
import { getCachedImage } from '@/lib/cache';

const TIMES_SERIE_A = [
  { id: '1', nome: 'Atlético Mineiro', escudo: '/escudos/atletico_mg.png' },
  { id: '2', nome: 'Bahia', escudo: '/escudos/bahia.png' },
  { id: '3', nome: 'Botafogo', escudo: '/escudos/botafogo.png' },
  { id: '4', nome: 'Red Bull Bragantino', escudo: '/escudos/bragantino.png' },
  { id: '5', nome: 'Ceará', escudo: '/escudos/ceara.png' },
  { id: '6', nome: 'Corinthians', escudo: '/escudos/corinthians.png' },
  { id: '7', nome: 'Cruzeiro', escudo: '/escudos/cruzeiro.png' },
  { id: '8', nome: 'Flamengo', escudo: '/escudos/flamengo.png' },
  { id: '9', nome: 'Fluminense', escudo: '/escudos/fluminense.png' },
  { id: '10', nome: 'Fortaleza', escudo: '/escudos/fortaleza.png' },
  { id: '11', nome: 'Grêmio', escudo: '/escudos/gremio.png' },
  { id: '12', nome: 'Internacional', escudo: '/escudos/internacional.png' },
  { id: '13', nome: 'Juventude', escudo: '/escudos/juventude.png' },
  { id: '14', nome: 'Mirassol', escudo: '/escudos/mirassol.png' },
  { id: '15', nome: 'Palmeiras', escudo: '/escudos/palmeiras.png' },
  { id: '16', nome: 'Santos', escudo: '/escudos/santos.png' },
  { id: '17', nome: 'São Paulo', escudo: '/escudos/sao_paulo.png' },
  { id: '18', nome: 'Sport', escudo: '/escudos/sport.png' },
  { id: '19', nome: 'Vasco', escudo: '/escudos/vasco.png' },
  { id: '20', nome: 'Vitória', escudo: '/escudos/vitoria.png' }
].sort((a, b) => a.nome.localeCompare(b.nome));

interface Jogador {
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
}

interface Figurinha {
  id: string;
  jogador: {
    id: string;
    nome: string;
    posicao?: string;
    time: {
      id: string;
      nome: string;
      escudo?: string;
    };
  };
  quantidadeAtual: number;
  raridade: 'Lendário' | 'Ouro' | 'Prata';
}

interface ModalFigurinhasProps {
  isOpen: boolean;
  onClose: () => void;
  figurinhas: Figurinha[];
  userFigurinhas: Set<string>;
  onAbrirOutroPacote?: () => void;
  temMaisPacotes?: boolean;
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

export default function ModalFigurinhas({ 
  isOpen, 
  onClose, 
  figurinhas, 
  userFigurinhas,
  onAbrirOutroPacote,
  temMaisPacotes = false
}: ModalFigurinhasProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <Dialog.Panel className="mx-auto w-full max-w-3xl bg-white rounded-xl shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-brasil-blue mb-4 sm:mb-6">
            Suas Figurinhas
          </Dialog.Title>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
            {figurinhas.map((figurinha) => (
              <div
                key={figurinha.id}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 ${getRaridadeStyle(figurinha.raridade)}`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getRaridadeImage(figurinha.raridade)}
                    alt={figurinha.jogador.nome}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-bold text-lg text-white drop-shadow-lg">{figurinha.jogador.nome}</p>
                      <p className="text-sm text-white/90 drop-shadow-lg">{figurinha.jogador.time.nome}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full p-1 shadow-lg">
                    <Image
                      src={figurinha.jogador.time.escudo || `/escudos/${figurinha.jogador.time.nome.toLowerCase().replace(/\s+/g, '_')}.png`}
                      alt={`Escudo ${figurinha.jogador.time.nome}`}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 rounded-lg bg-brasil-blue text-white hover:bg-brasil-blue/90 text-sm sm:text-base"
            >
              Fechar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 