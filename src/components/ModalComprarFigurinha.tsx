import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { TIMES_SERIE_A, Time } from '@/lib/constants';
import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalComprarFigurinhaProps {
  isOpen: boolean;
  onClose: () => void;
  raridade: string;
  onConfirmar: (jogadorId: string) => void;
}

interface Jogador {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  time: {
    id: string;
    nome: string;
  };
  raridade: string;
}

export default function ModalComprarFigurinha({
  isOpen,
  onClose,
  raridade,
  onConfirmar
}: ModalComprarFigurinhaProps) {
  const [timeSelecionado, setTimeSelecionado] = useState<string>('');
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [jogadorSelecionado, setJogadorSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Efeito para limpar os estados quando o modal for fechado
  useEffect(() => {
    if (!isOpen) {
      setTimeSelecionado('');
      setJogadores([]);
      setJogadorSelecionado('');
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeSelecionado) {
      fetchJogadores();
    }
  }, [timeSelecionado]);

  const fetchJogadores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jogadores?timeId=${timeSelecionado}&raridade=${raridade}`);
      if (!response.ok) throw new Error('Erro ao carregar jogadores');
      const data = await response.json();
      setJogadores(data);
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = () => {
    if (jogadorSelecionado) {
      onConfirmar(jogadorSelecionado);
      onClose();
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
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brasil-blue focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                      Comprar Figurinha {raridade}
                    </Dialog.Title>

                    <div className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selecione o Time
                        </label>
                        <select
                          value={timeSelecionado}
                          onChange={(e) => setTimeSelecionado(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-brasil-blue focus:outline-none focus:ring-brasil-blue sm:text-sm"
                        >
                          <option value="">Selecione um time</option>
                          {TIMES_SERIE_A.map((time) => (
                            <option key={time.id} value={time.id}>
                              {time.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      {timeSelecionado && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecione o Jogador
                          </label>
                          {loading ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brasil-blue"></div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                              {jogadores.map((jogador) => (
                                <button
                                  key={jogador.id}
                                  onClick={() => setJogadorSelecionado(jogador.id)}
                                  className={`p-2 sm:p-4 rounded-lg border-2 transition-all ${
                                    jogadorSelecionado === jogador.id
                                      ? 'border-brasil-green bg-brasil-green/10'
                                      : 'border-gray-200 hover:border-brasil-green/50'
                                  }`}
                                >
                                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-1 sm:mb-2">
                                    <Image
                                      src={getRaridadeImage(raridade)}
                                      alt={jogador.nome}
                                      fill
                                      className="object-contain p-2"
                                    />
                                  </div>
                                  <div className="text-center">
                                    <p className="font-medium text-sm sm:text-base text-black line-clamp-1">{jogador.nome}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-brasil-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brasil-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brasil-blue disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleConfirmar}
                        disabled={!jogadorSelecionado}
                      >
                        Confirmar Compra
                      </button>
                    </div>
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