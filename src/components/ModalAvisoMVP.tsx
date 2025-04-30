import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ModalAvisoMVPProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalAvisoMVP({ isOpen, onClose }: ModalAvisoMVPProps) {
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-60 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-6 py-8 text-left shadow-xl transition-all max-w-2xl w-full">
                <Dialog.Title as="h3" className="text-2xl font-bold text-center text-brasil-blue mb-2">
                  🚧 MVP em Evolução! 🚀
                </Dialog.Title>
                <div className="mt-2 text-center">
                  <p className="text-base text-gray-700 mb-2">Olá, colecionador! 😃</p>
                  <p className="text-base text-gray-700 mb-2">
                    Você está usando uma versão <b>MVP</b> (Produto Mínimo Viável) do nosso álbum digital. Isso significa que ainda estamos ajustando, testando e melhorando a plataforma — então, pode ser que você encontre algum errinho ou instabilidade pelo caminho.
                  </p>
                  <p className="text-base text-gray-700 mb-2">
                    <b>Em breve, lançaremos a versão oficial!</b> Quando isso acontecer, faremos uma limpeza no banco de dados para que todos os usuários comecem do zero, em igualdade de condições.
                  </p>
                  <p className="text-base text-gray-700 mb-2">
                    Aproveite para explorar, dar feedback e se divertir!
                  </p>
                  <p className="text-base text-brasil-green font-semibold mt-2">
                    Muito obrigado por fazer parte dessa fase inicial. 💚💛
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    className="rounded-lg bg-brasil-blue px-6 py-2 text-white font-bold shadow hover:bg-brasil-blue/90 transition"
                    onClick={onClose}
                  >
                    Entendi!
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