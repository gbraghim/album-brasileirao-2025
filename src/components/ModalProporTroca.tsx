import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';
import React from 'react';
import { Figurinha, Jogador } from '@/types';
import FigurinhaCard from './FigurinhaCard';
import { getCachedImage } from '@/lib/cache';

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
  figurinhasEmPropostaPendente: string[];
}

export default function ModalProporTroca({ isOpen, onClose, troca, onProporTroca, loading = false, figurinhasRepetidas, figurinhasEmPropostaPendente }: ModalProporTrocaProps) {
  if (!troca) {
    return null;
  }

  const [currentImageIndex, setCurrentImageIndex] = React.useState<Record<string, number>>({});
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});
  const [cachedSrcs, setCachedSrcs] = React.useState<Record<string, string>>({});

  const handleImageError = (figurinhaId: string, time: string, nome: string) => {
    const caminhos = formatarCaminhoImagem(time, nome);
    const currentIndex = currentImageIndex[figurinhaId] || 0;
    if (currentIndex < caminhos.length - 1) {
      console.log(`Tentando próximo formato para ${nome} do ${time}: ${caminhos[currentIndex + 1]}`);
      setCurrentImageIndex(prev => ({ ...prev, [figurinhaId]: currentIndex + 1 }));
    } else {
      console.error(`Todos os formatos falharam para ${nome} do ${time}. Caminhos tentados:`, caminhos);
      setImageErrors(prev => ({ ...prev, [figurinhaId]: true }));
    }
  };

  React.useEffect(() => {
    async function cacheImages() {
      const updates: Record<string, string> = {};
      if (troca) {
        const caminhos = formatarCaminhoImagem(troca.figurinhaOferta.jogador.time.nome, troca.figurinhaOferta.jogador.nome);
        try {
          const cachedSrc = await getCachedImage(caminhos[0]);
          updates[troca.figurinhaOferta.jogador.id] = cachedSrc;
          console.log(`Cache de imagem bem sucedido para ${troca.figurinhaOferta.jogador.nome}`);
        } catch (error) {
          console.error(`Erro ao fazer cache da imagem para ${troca.figurinhaOferta.jogador.nome}:`, error);
        }
      }
      setCachedSrcs(updates);
    }
    if (troca) cacheImages();
  }, [troca as ModalProporTrocaProps['troca']]);

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
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white px-6 pb-6 pt-7 text-left shadow-2xl transition-all">
                <button
                  type="button"
                  className="absolute right-4 top-4 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brasil-blue focus:ring-offset-2 z-10"
                  onClick={onClose}
                >
                  <span className="sr-only">Fechar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="mb-2">
                  <Dialog.Title as="h2" className="text-2xl font-bold text-brasil-blue text-center mb-1">
                    Propor Troca
                  </Dialog.Title>
                  <p className="text-center text-gray-600 text-base mb-4">
                    Você está propondo uma troca para a figurinha <span className="font-semibold text-brasil-blue">{troca.figurinhaOferta.jogador.nome}</span>
                  </p>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">Selecione uma figurinha para troca:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {figurinhasRepetidas.filter(f => f.raridade.toLowerCase() !== 'lendário' && f.raridade.toLowerCase() !== 'lendario').map((figurinha) => {
                    const isEmPropostaPendente = figurinhasEmPropostaPendente.includes(figurinha.jogador.id);
                    return (
                      <div
                        key={figurinha.id}
                        className={`relative flex flex-col items-center p-3 border-2 rounded-xl shadow-md transition-all duration-200 bg-white w-full min-w-0
                          ${isEmPropostaPendente ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' : 'hover:shadow-xl hover:border-brasil-blue cursor-pointer'}`}
                        onClick={() => !isEmPropostaPendente && onProporTroca(figurinha)}
                        style={{ minHeight: 210 }}
                      >
                        {renderFigurinha(figurinha)}
                        <span className="text-base font-semibold text-gray-900 mt-2 mb-0.5 text-center w-full truncate">{figurinha.jogador.nome}</span>
                        <div className="flex items-center justify-center gap-1 mb-0.5 w-full">
                          {figurinha.jogador.time.escudo && (
                            <Image
                              src={figurinha.jogador.time.escudo}
                              alt={figurinha.jogador.time.nome}
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                          )}
                          <span className="text-xs text-gray-500 text-center truncate">{figurinha.jogador.time.nome}</span>
                        </div>
                        {(figurinha.quantidade - 1) > 0 && (
                          <span className="text-xs text-brasil-blue font-bold mb-1">Repetida(s): {figurinha.quantidade - 1}</span>
                        )}
                        {isEmPropostaPendente && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-xl z-10">
                            <span className="text-xs text-gray-600 font-semibold flex items-center gap-1">
                              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-yellow-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' /></svg>
                              Em proposta pendente
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg bg-red-400 hover:bg-red-500 text-white px-6 py-2 text-base font-semibold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
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