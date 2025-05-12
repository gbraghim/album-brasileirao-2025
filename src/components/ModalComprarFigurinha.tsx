import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { TIMES_SERIE_A, Time } from '@/lib/constants';
import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';

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
            Comprar Figurinha {raridade}
          </Dialog.Title>

          <div className="space-y-4 sm:space-y-6">
            {/* Seleção de Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione o Time
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {TIMES_SERIE_A.map((time: Time) => (
                  <button
                    key={time.id}
                    onClick={() => setTimeSelecionado(time.id)}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                      timeSelecionado === time.id
                        ? 'border-brasil-green bg-brasil-green/10'
                        : 'border-gray-200 hover:border-brasil-green/50'
                    }`}
                  >
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2">
                      <Image
                        src={time.escudo}
                        alt={time.nome}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-center block line-clamp-2 text-black">{time.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Jogadores */}
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
                            src={formatarCaminhoImagem(jogador.time.nome, jogador.nome)[0]}
                            alt={jogador.nome}
                            fill
                            className="object-contain"
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

          <div className="mt-6 sm:mt-8 flex justify-end space-x-2 sm:space-x-4">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={!jogadorSelecionado}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base ${
                jogadorSelecionado
                  ? 'bg-brasil-green text-white hover:bg-brasil-green/90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirmar Compra
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 