import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  jogador: Jogador;
  quantidade: number;
}

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
  onProporTroca: (figurinha: Figurinha) => void;
  loading?: boolean;
}

export default function ModalProporTroca({ 
  isOpen, 
  onClose, 
  troca,
  onProporTroca,
  loading = false 
}: ModalProporTrocaProps) {
  const handleClose = () => {
    onClose();
  };

  const handleProporTroca = () => {
    if (troca) {
      onProporTroca(troca.figurinhaOferta);
    }
  };

  if (!troca) {
    return null;
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
                    onClick={handleClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-brasil-blue mb-4">
                  Propor Troca para {troca.figurinhaOferta.jogador.nome}
                </Dialog.Title>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Você está propondo uma troca para a figurinha #{troca.figurinhaOferta.jogador.numero} - {troca.figurinhaOferta.jogador.nome} ({troca.figurinhaOferta.jogador.time.nome})
                  </p>
                  
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleProporTroca}
                      disabled={loading}
                      className="w-full bg-brasil-green hover:bg-brasil-green/90 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processando...' : 'Confirmar Troca'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 