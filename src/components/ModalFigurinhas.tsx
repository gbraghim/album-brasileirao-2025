import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';

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
  animacaoRapida?: boolean;
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

export default function ModalFigurinhas({ 
  isOpen, 
  onClose, 
  figurinhas, 
  userFigurinhas,
  onAbrirOutroPacote,
  temMaisPacotes = false,
  animacaoRapida = false
}: ModalFigurinhasProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (jogadorId: string, time: string, nome: string) => {
    if (loadedImages[jogadorId]) {
      console.log(`Imagem já carregada para ${nome} do ${time}, parando busca`);
      return;
    }

    const caminhos = formatarCaminhoImagem(time, nome);
    const currentIndex = currentImageIndex[jogadorId] || 0;
    
    if (currentIndex < caminhos.length - 1) {
      console.log(`Tentando próximo formato para ${nome} do ${time}: ${caminhos[currentIndex + 1]}`);
      setCurrentImageIndex(prev => ({
        ...prev,
        [jogadorId]: currentIndex + 1
      }));
    } else {
      console.error(`Todos os formatos falharam para ${nome} do ${time}`);
      setImageErrors(prev => ({
        ...prev,
        [jogadorId]: true
      }));
    }
  };

  const handleImageLoad = (jogadorId: string, caminho: string) => {
    console.log(`Imagem carregada com sucesso para jogador ${jogadorId}: ${caminho}`);
    setLoadedImages(prev => ({
      ...prev,
      [jogadorId]: true
    }));
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white/90 backdrop-blur-sm px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white/50 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-brasil-blue mb-4 text-center">
                  Figurinhas do Pacote
                </Dialog.Title>
                
                {!temMaisPacotes && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-yellow-800 font-medium">
                      Você não tem mais pacotes disponíveis! 
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Compre mais pacotes para completar seu álbum mais rápido e aumentar suas chances de encontrar figurinhas lendárias!
                    </p>
                  </div>
                )}
                
                <div className="mt-2">
                  <div className="grid grid-cols-2 gap-4 justify-items-center">
                    {figurinhas.map((figurinha) => {
                      const caminhos = formatarCaminhoImagem(
                        figurinha.jogador.time.nome,
                        figurinha.jogador.nome
                      );
                      const currentIndex = currentImageIndex[figurinha.jogador.id] || 0;
                      const imagemAtual = imageErrors[figurinha.jogador.id]
                        ? '/public/placeholder.jpg'
                        : caminhos[currentIndex];

                      return (
                        <div key={figurinha.jogador.id} className="relative">
                          <div className={`relative w-32 h-48 rounded-lg border-4 ${getRaridadeStyle(figurinha.raridade)} shadow-lg overflow-hidden transition-all ${animacaoRapida ? 'duration-100' : 'duration-300'} hover:scale-105`}>
                            {/* Imagem do jogador */}
                            <div className="relative w-full h-40">
                              <Image
                                src={imagemAtual}
                                alt={figurinha.jogador.nome}
                                fill
                                className="object-cover"
                                onError={() => handleImageError(figurinha.jogador.id.toString(), figurinha.jogador.time.nome, figurinha.jogador.nome)}
                                onLoad={() => handleImageLoad(figurinha.jogador.id.toString(), imagemAtual)}
                              />
                            </div>

                            {/* Informações do jogador */}
                            <div className="p-1 bg-white/90 backdrop-blur-sm">
                              <p className="text-sm font-bold text-center text-black truncate">{figurinha.jogador.nome}</p>
                              <p className="text-xs text-center text-black truncate">{figurinha.jogador.posicao || 'N/A'}</p>
                            </div>

                            {/* Indicador de raridade */}
                            <div className="absolute top-1 right-1">
                              <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                figurinha.raridade === 'Lendário' ? 'bg-purple-600/80 text-white' :
                                figurinha.raridade === 'Ouro' ? 'bg-yellow-500/80 text-black' :
                                'bg-gray-400/80 text-black'
                              }`}>
                                {figurinha.raridade}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4">
                  {temMaisPacotes && onAbrirOutroPacote ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className="w-full justify-center rounded-lg bg-brasil-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brasil-green/80 transition-colors"
                        onClick={() => {
                          if (onAbrirOutroPacote) {
                            onAbrirOutroPacote();
                          }
                        }}
                      >
                        Abrir Outro Pacote
                      </button>
                      <button
                        type="button"
                        className="w-full justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 transition-colors"
                        onClick={onClose}
                      >
                        Fechar
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        className="w-full justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 transition-colors sm:w-auto"
                        onClick={onClose}
                      >
                        Fechar
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 