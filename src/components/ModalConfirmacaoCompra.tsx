import { Dialog } from '@headlessui/react';
import Link from 'next/link';

interface ModalConfirmacaoCompraProps {
  isOpen: boolean;
  onClose: () => void;
  jogador: {
    nome: string;
    time: {
      nome: string;
    };
    raridade: string;
  };
}

export default function ModalConfirmacaoCompra({
  isOpen,
  onClose,
  jogador
}: ModalConfirmacaoCompraProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">


          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-brasil-blue mb-2">
              🎉 Figurinha Adicionada ao Seu Álbum! 🎉
            </h2>

          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Você adquiriu a figurinha do jogador:
            </p>
            <div className="bg-brasil-blue/5 p-4 rounded-lg">
              <p className="font-semibold text-brasil-blue">{jogador.nome}</p>
              <p className="text-sm text-gray-600">Time: {jogador.time.nome}</p>
              <p className="text-sm text-gray-600">Raridade: {jogador.raridade}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Link
              href="/meu-album"
              className="w-full bg-brasil-green text-white px-4 py-2 rounded-lg text-center hover:bg-brasil-green/90 transition-colors"
            >
              Ver no Meu Álbum
            </Link>
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 px-4 py-2"
            >
              Continuar Comprando
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 