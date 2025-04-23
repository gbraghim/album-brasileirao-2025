import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';

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
  id: number;
  jogador: {
    id: number;
    nome: string;
    numero: number;
    posicao: string;
    nacionalidade: string;
    foto: string;
    time: {
      id: number;
      nome: string;
      escudo: string;
    };
  };
  quantidadeAtual: number;
}

interface ModalFigurinhasProps {
  isOpen: boolean;
  onClose: () => void;
  figurinhas: Figurinha[];
  userFigurinhas: Set<string>;
}

export default function ModalFigurinhas({ isOpen, onClose, figurinhas, userFigurinhas }: ModalFigurinhasProps) {
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white/90 backdrop-blur-sm px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-brasil-blue hover:text-brasil-green focus:outline-none focus:ring-2 focus:ring-brasil-green focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-brasil-blue mb-4">
                  Figurinhas do Pacote
                </Dialog.Title>
                
                <div className="mt-2">
                  <div className="grid grid-cols-1 gap-3">
                    {figurinhas.map((figurinha) => (
                      <div key={figurinha.id} className="relative">
                        <div className="bg-white rounded-lg shadow-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {figurinha.jogador.nome}
                            </span>
                            <span className="text-sm text-gray-500">
                              {figurinha.quantidadeAtual > 1 ? 'Repetida' : 'Nova'}
                            </span>
                          </div>
                          <div className="relative w-full aspect-[3/4] mb-2 max-w-[200px] mx-auto">
                            <Image
                              src={formatarCaminhoImagem(figurinha.jogador.time.nome, figurinha.jogador.nome)}
                              alt={figurinha.jogador.nome}
                              fill
                              className="object-cover rounded-lg"
                              sizes="(max-width: 640px) 200px, (max-width: 1024px) 200px, 200px"
                              priority
                              onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                e.currentTarget.src = '/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            {figurinha.jogador.time.escudo && (
                              <Image
                                src={figurinha.jogador.time.escudo}
                                alt={figurinha.jogador.time.nome}
                                width={24}
                                height={24}
                                className="w-6 h-6"
                                priority
                              />
                            )}
                            <span className="text-sm text-gray-500">
                              {figurinha.jogador.time.nome}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Quantidade: {figurinha.quantidadeAtual}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full justify-center rounded-lg bg-brasil-blue px-4 py-2 text-sm font-semibold text-brasil-yellow shadow-sm hover:bg-brasil-blue/80 transition-colors sm:w-auto"
                    onClick={onClose}
                  >
                    Fechar
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