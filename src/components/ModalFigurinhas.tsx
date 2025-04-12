import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Jogador {
  id: string;
  nome: string;
  time: {
    nome: string;
  };
  posicao: string;
  idade: number;
  numero: number;
}

interface Figurinha {
  id: string;
  jogador: Jogador;
  nova?: boolean;
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white/90 backdrop-blur-sm px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-brasil-blue mb-4">
                    Figurinhas do Pacote
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      {figurinhas.map((figurinha) => (
                        <div
                          key={figurinha.id}
                          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-brasil-yellow/20 relative transform transition-all duration-300 hover:scale-[1.02]"
                        >
                          {userFigurinhas.has(figurinha.jogador.id) ? (
                            <span className="absolute top-2 right-2 bg-brasil-yellow text-brasil-blue px-3 py-1 rounded-full text-sm font-medium">
                              Repetida
                            </span>
                          ) : (
                            <span className="absolute top-2 right-2 bg-brasil-green text-white px-3 py-1 rounded-full text-sm font-medium">
                              Nova
                            </span>
                          )}
                          <div className="flex flex-col">
                            <h4 className="text-lg font-semibold text-brasil-blue">
                              #{figurinha.jogador.numero} - {figurinha.jogador.nome}
                            </h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="font-medium text-brasil-green">Time:</span>{' '}
                                <span className="text-brasil-blue">{figurinha.jogador.time.nome}</span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium text-brasil-green">Posição:</span>{' '}
                                <span className="text-brasil-blue">{figurinha.jogador.posicao}</span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium text-brasil-green">Idade:</span>{' '}
                                <span className="text-brasil-blue">{figurinha.jogador.idade} anos</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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