import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatarCaminhoImagem, getS3PlayerUrl } from '@/lib/utils';
import React from 'react';
import { Figurinha, Jogador } from '@/types';
import FigurinhaCard from './FigurinhaCard';

interface ModalProporTrocaProps {
  isOpen: boolean;
  onClose: () => void;
  troca: {
    id: string;
    figurinhaOferta: {
      id: string;
      jogador: Jogador;
      quantidade: number;
    };
  } | null;
  onProporTroca: (figurinha: Figurinha) => Promise<void>;
  loading?: boolean;
  figurinhasRepetidas: Figurinha[];
}

export default function ModalProporTroca({ isOpen, onClose, troca, onProporTroca, loading = false, figurinhasRepetidas }: ModalProporTrocaProps) {
  if (!troca) {
    return null;
  }

  const [currentImageIndex, setCurrentImageIndex] = React.useState<Record<string, number>>({});
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const handleImageError = (figurinhaId: string, time: string, nome: string) => {
    const caminhos = formatarCaminhoImagem(time, nome);
    const currentIndex = currentImageIndex[figurinhaId] || 0;
    if (currentIndex < caminhos.length - 1) {
      setCurrentImageIndex(prev => ({ ...prev, [figurinhaId]: currentIndex + 1 }));
    } else {
      setImageErrors(prev => ({ ...prev, [figurinhaId]: true }));
    }
  };

  // Função para renderizar uma figurinha usando o FigurinhaCard
  const renderFigurinha = (figurinha: any) => {
    return (
      <FigurinhaCard
        jogador={{
          id: figurinha.jogador.id,
          nome: figurinha.jogador.nome,
          numero: figurinha.jogador.numero,
          posicao: figurinha.jogador.posicao,
          nacionalidade: figurinha.jogador.nacionalidade,
          time: figurinha.jogador.time,
          raridade: figurinha.raridade
        }}
        jogadorColetado={true}
        currentImageIndex={0}
        onImageError={() => {}}
      />
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Propor Troca
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Você está propondo uma troca para a figurinha de {troca.figurinhaOferta.jogador.nome}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Selecione uma figurinha para troca:</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        {figurinhasRepetidas.filter(f => f.raridade.toLowerCase() !== 'lendário' && f.raridade.toLowerCase() !== 'lendario').map((figurinha) => (
                          <div 
                            key={figurinha.id}
                            className="relative flex flex-col items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                            onClick={() => onProporTroca(figurinha)}
                          >
                            {renderFigurinha(figurinha)}
                            <span className="text-sm font-medium text-gray-900">{figurinha.jogador.nome}</span>
                            <span className="text-xs text-gray-500">{figurinha.jogador.time.nome}</span>
                            <span className="text-xs text-gray-500">Quantidade: {figurinha.quantidade}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">

                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-red-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 