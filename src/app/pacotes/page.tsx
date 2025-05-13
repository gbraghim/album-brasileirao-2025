'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Pacote as PacoteType } from '@/types/pacote';
import ProdutosFigurinha from '@/components/ProdutosFigurinha';
import ModalConfirmacaoCompra from '@/components/ModalConfirmacaoCompra';
import { prisma } from '@/lib/prisma';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

interface Jogador {
  id: string;
  nome: string;
  raridade: string;
  time: {
    nome: string;
  };
}

interface Pacote extends Omit<PacoteType, 'figurinhas'> {
  id: string;
  figurinhas?: Array<{ id: string }>;
}

interface AlbumResponse {
  jogadores: Jogador[];
}

interface PacotePremium {
  id: string;
  nome: string;
  descricao: string;
  valorCentavos: number;
  quantidade: number;
}

const ModalFigurinhas = lazy(() => import('@/components/ModalFigurinhas'));
const PacoteAnimation = lazy(() => import('@/components/PacoteAnimation'));
const Modal = lazy(() => import('@/components/Modal'));
const Header = lazy(() => import('@/components/Header'));
const Footer = lazy(() => import('@/components/Footer'));

function PacotesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [figurinhasAbertas, setFigurinhasAbertas] = useState<any[]>([]);
  const [userFigurinhas, setUserFigurinhas] = useState<Set<string>>(new Set());
  const [pacoteAbrindo, setPacoteAbrindo] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [pacotesPremium, setPacotesPremium] = useState<PacotePremium[]>([]);
  const [abrindoPacote, setAbrindoPacote] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [produtosFigurinha, setProdutosFigurinha] = useState<any[]>([]);
  const [compraEmProgresso, setCompraEmProgresso] = useState<string | null>(null);
  const [erroCompra, setErroCompra] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [jogador, setJogador] = useState<Jogador | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.email) {
      carregarPacotes();
    }

    // Carregar produtos de figurinha
    fetch('/api/produtos-figurinha')
      .then(res => res.json())
      .then(data => setProdutosFigurinha(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Erro ao carregar produtos:', err);
        setError('Erro ao carregar produtos');
      });

    // Carregar pacotes extras/premium disponíveis para compra
    fetch('/api/pacotes-preco')
      .then(res => res.json())
      .then(data => setPacotesPremium(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Erro ao carregar pacotes extras:', err);
      });

    const success = searchParams?.get('success');
    const jogadorId = searchParams?.get('jogadorId');

    if (success === 'true' && jogadorId) {
      // Buscar dados do jogador
      fetch(`/api/jogadores/${jogadorId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Erro ao buscar dados do jogador');
          }
          return res.json();
        })
        .then(data => {
          setJogador(data);
          setShowModal(true);
        })
        .catch(err => {
          console.error('Erro ao buscar dados do jogador:', err);
          setError('Erro ao buscar dados do jogador');
        });
    }
  }, [status, router, session?.user?.email, searchParams]);

  const carregarPacotes = async () => {
    try {
      const response = await fetch('/api/pacotes', { headers: { 'Cache-Control': 'no-store' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Erro ao carregar pacotes');
      const data = await response.json();
      setPacotes(Array.isArray(data) ? data.filter(p => p.aberto === false) : []);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
      setError('Erro ao carregar pacotes');
    } finally {
      setLoading(false);
    }
  };

  const fetchPacotes = async () => {
    try {
      const response = await fetch('/api/pacotes');
      if (!response.ok) {
        throw new Error('Erro ao carregar pacotes');
      }
      const data = await response.json();
      setPacotes(data);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
      toast.error('Erro ao carregar pacotes');
    }
  };

  const handleAbrirPacote = async (pacoteId: string) => {
    try {
      setLoading(true);
      setPacoteAbrindo(pacoteId);
      setShowAnimation(true);
      
      const response = await fetch('/api/pacotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pacoteId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao abrir pacote');
      }

      const data = await response.json();
      setFigurinhasAbertas(data.figurinhas);
      await fetchPacotes(); // Atualiza a lista de pacotes
    } catch (error) {
      console.error('Erro ao abrir pacote:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao abrir pacote');
      setShowAnimation(false);
    } finally {
      setLoading(false);
      setPacoteAbrindo(null);
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
  };

  const handleAbrirOutroPacote = async () => {
    if (pacotes.length > 0) {
      setModalAberto(false);
      await handleAbrirPacote(pacotes[0].id);
    }
  };

  const comprarPacote = async (pacoteId: string) => {
    if (!session?.user?.id) {
      alert('Faça login para comprar pacotes!');
      return;
    }

    setCompraEmProgresso(pacoteId);
    setErroCompra(null);
    setLoading(true);

    let tentativas = 0;
    const maxTentativas = 3;

    while (tentativas < maxTentativas) {
      try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pacoteId, userId: session.user.id }),
    });

        if (!res.ok) {
          throw new Error(`Erro na requisição: ${res.status}`);
        }

    const data = await res.json();
        
    if (data.url) {
      window.location.href = data.url;
          return;
        } else {
          throw new Error('URL de checkout não recebida');
        }
      } catch (err) {
        console.error(`Tentativa ${tentativas + 1} falhou:`, err);
        tentativas++;
        
        if (tentativas === maxTentativas) {
          setErroCompra('Não foi possível conectar ao serviço de pagamento. Por favor, tente novamente em alguns instantes.');
    } else {
          // Espera 2 segundos antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    setLoading(false);
    setCompraEmProgresso(null);
  };

  // Separar pacotes por tipo
  const pacotesDiarios = pacotes.filter(p => p.tipo?.toUpperCase() === 'DIARIO');
  const pacotesIniciais = pacotes.filter(p => p.tipo?.toUpperCase() === 'INICIAL');
  const pacotesPremiumUser = pacotes.filter(p => p.tipo?.toUpperCase() === 'COMPRADO');

  // Filtro seguro para pacotes extras disponíveis para compra
  // Considera apenas produtos que têm quantidade definida e não têm raridade (ou seja, não são figurinhas individuais)
  const pacotesExtras = pacotesPremium.filter(
    (p: any) => p.ativo && p.quantidade && (!p.raridade || p.raridade === null)
  );

  // Verifica se o usuário não tem nenhum pacote dos tipos Diários, Extras (Premium) ou Boas-vindas
  const semNenhumPacote =
    pacotesDiarios.length === 0 &&
    pacotesPremiumUser.length === 0 &&
    pacotesIniciais.length === 0;

  // Ao fechar o modal, garantir que ele não volte a aparecer
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    if (typeof window !== 'undefined' && session?.user?.email) {
      const key = `welcomeModalShown_${session.user.email}`;
      localStorage.setItem(key, 'true');
    }
  };

  // Adicionar classes utilitárias para blocos de seção
  const sectionBlock = "rounded-2xl shadow-xl bg-white/90 border border-brasil-blue/10 mb-12 py-8 px-4 md:px-10";
  const sectionBlockAlt = "rounded-2xl shadow-xl bg-blue-50 border border-brasil-blue/10 mb-12 py-8 px-4 md:px-10";
  const sectionTitle = "text-3xl font-extrabold text-brasil-blue mb-6 text-center tracking-tight";
  const sectionDivider = <div className="w-full h-0.5 bg-brasil-blue/10 my-10 rounded-full" />;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brasil-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            carregarPacotes();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <main>
        {/* Aviso para quando não há pacotes diários */}
        {pacotesDiarios.length === 0 && (
          <div className="w-full flex justify-center mt-6 mb-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow max-w-2xl w-full text-yellow-800 text-center text-base font-semibold">
              Você já abriu todos os pacotes gratuitos do dia!<br />
              Para continuar colecionando figurinhas hoje, faça trocas com outros usuários, compre jogadores desejados ou adquira pacotes extras.
            </div>
          </div>
        )}
        <Suspense fallback={<div className="flex justify-center items-center h-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>}>
        </Suspense>

        <Modal
          isOpen={showWelcomeModal}
          onClose={handleCloseWelcomeModal}
          title="Bem-vindo ao Álbum!"
        >
          <div className="text-center space-y-4">
            <p className="text-lg text-white font-semibold">Parabéns! Você ganhou <span className="text-brasil-yellow font-bold">3 pacotes</span> ao se cadastrar.</p>
            <p className="text-white">E todos os dias você ganhará mais <span className="text-brasil-yellow font-bold">3 pacotes diários</span> para continuar colecionando!</p>
            <button
              className="mt-4 bg-brasil-blue hover:bg-brasil-green text-white px-6 py-2 rounded-lg font-bold shadow"
              onClick={handleCloseWelcomeModal}
            >
              Começar a colecionar!
            </button>
          </div>
        </Modal>

        {/* Seção Comprar Pacotes Premium no topo se não houver pacotes disponíveis */}
        {/* REMOVIDO: <div className={sectionBlock}> ... </div> referente a 'Comprar Pacotes' */}

        {/* Se o usuário não tem nenhum pacote, exibe as seções de compra no topo */}
        {semNenhumPacote && (
          <>
            {/* Comprar Jogadores Desejados */}
            <div className={sectionBlockAlt}>
              <h2 className={sectionTitle}>Comprar Jogadores Desejados</h2>
              <div className="flex flex-col items-center w-full">
                <p className="bg-brasil-green/10 border-2 border-brasil-green text-brasil-green text-base md:text-lg font-bold rounded-xl px-8 py-5 shadow-lg max-w-3xl w-full text-center mb-8 mx-auto">
                  Colecione o jogador que você deseja sem depender da sorte, cole-o diretamente no seu álbum!
                </p>
                <ProdutosFigurinha 
                  produtos={
                    [...produtosFigurinha].sort((a, b) => {
                      const ordem: Record<string, number> = { 'Lendário': 0, 'lendário': 0, 'lendario': 0, 'Ouro': 1, 'ouro': 1, 'Prata': 2, 'prata': 2 };
                      const raridadeA = String(a.raridade).toLowerCase();
                      const raridadeB = String(b.raridade).toLowerCase();
                      return (ordem[raridadeA] ?? 3) - (ordem[raridadeB] ?? 3);
                    })
                  }
                  compraEmProgresso={compraEmProgresso}
                />
              </div>
            </div>
            {/* Comprar Pacotes Extras */}
            <div className={sectionBlock}>
              <h2 className={sectionTitle}>Comprar Pacotes Extras</h2>
                <ul className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  {pacotesExtras.map((pacote) => {
                    const precoUnitario = pacote.valorCentavos / pacote.quantidade / 100;
                    const isTriplo = pacote.quantidade === 3;
                    return (
                      <li key={pacote.id} className={`flex-1 border-2 ${isTriplo ? 'border-yellow-500' : 'border-brasil-blue'} rounded-xl p-6 bg-white/90 shadow-lg flex flex-col items-center hover:shadow-2xl transition-shadow max-w-xs mx-auto min-w-[270px] min-h-[420px] relative ${isTriplo ? 'before:absolute before:inset-0 before:rounded-xl before:border-4 before:border-yellow-500/50 before:animate-pulse before:pointer-events-none' : ''}`}>
                        <div className="mb-4 flex justify-center items-center">
                          {pacote.quantidade === 1 && <Image src="/IndividualPremium.png" alt="1 pacote" width={120} height={120} />}
                          {pacote.quantidade === 2 && <Image src="/DuploPremium.png" alt="2 pacotes" width={120} height={120} />}
                          {pacote.quantidade === 3 && <Image src="/TriploPremium.png" alt="3 pacotes" width={120} height={120} />}
                        </div>
                        <div className="font-semibold text-lg mb-1 text-brasil-blue text-center">{pacote.nome}</div>
                        <div className="text-gray-600 mb-2 text-center">{pacote.descricao}</div>
                        <div className="text-brasil-blue font-bold text-xl mb-2 text-center">R$ {(pacote.valorCentavos / 100).toFixed(2)}</div>
                        {isTriplo ? (
                          <div className="text-brasil-green text-sm mb-2 text-center">
                            <span>Preço unitário do pacote: R$ {precoUnitario.toFixed(2)}</span><br />
                            <span className="font-bold">Preço por figurinha: R$ {(precoUnitario / 4).toFixed(2)}</span>
                            <div className="mt-1 inline-block bg-brasil-green/10 text-brasil-green px-2 py-1 rounded text-xs font-bold ml-2">Oferta mais vantajosa!</div>
                          </div>
                        ) : (
                          <div className="text-black text-sm mb-4 text-center">
                            <span>Preço unitário do pacote: R$ {precoUnitario.toFixed(2)}</span><br />
                            <span className="font-bold">Preço por figurinha: R$ {(precoUnitario / 4).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex-grow" />
                    <button
                      onClick={() => comprarPacote(pacote.id)}
                      disabled={loading}
                          className={`${isTriplo ? 'bg-gradient-to-r from-yellow-500 to-brasil-green hover:from-brasil-green hover:to-yellow-500' : 'bg-gradient-to-r from-brasil-yellow to-brasil-green hover:from-brasil-green hover:to-brasil-yellow'} text-brasil-blue px-8 py-3 rounded-lg font-bold shadow-lg transition-colors text-lg w-full mt-4`}
                    >
                      Comprar
                    </button>
                  </li>
                    );
                  })}
              </ul>
            </div>
          </>
        )}

        {/* Pacotes Diários */}
        {pacotesDiarios.length > 0 && (
          <>
            <div className={sectionBlockAlt}>
              <h2 className={sectionTitle}>Pacotes Diários</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
                {pacotesDiarios.map((pacote) => (
                  <div key={pacote.id} className="relative group cursor-pointer bg-white/80 shadow-lg transform transition-all bg-white-80 duration-300 scale-75 hover:scale-80" onClick={() => handleAbrirPacote(pacote.id)}>
                    <div className="relative w-full h-[300px] backdrop-blur-sm rounded-lg bg-white-80 overflow-hidden">
                      <Image src="/pacoteTransparente.png" alt="Pacote Diário" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain" />
                      <div className="absolute inset-0 flex items-center  justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                        <button
                          disabled={abrindoPacote || showAnimation}
                          className="bg-brasil-yellow text-brasil-blue font-bold py-2 px-4 rounded-lg shadow-lg hover:scale-110 transition-transform"
                        >
                          Abrir Pacote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {(pacotesPremiumUser.length > 0 || pacotesIniciais.length > 0 || !semNenhumPacote) && sectionDivider}
          </>
        )}

        {/* Pacotes Extras (Premium) */}
        {pacotesPremiumUser.length > 0 && (
          <>
            <div className={sectionBlockAlt}>
              <h2 className={sectionTitle}>Pacotes Extras</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {pacotesPremiumUser.map((pacote) => (
                  <div key={pacote.id} className="relative group cursor-pointer bg-white/80 shadow-lg transform transition-all duration-300 scale-75 hover:scale-80" onClick={() => handleAbrirPacote(pacote.id)}>
                    <div className="relative w-full h-[300px] backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                      <Image src="/IndividualPremium.png" alt="Pacote Premium" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-4" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                        <button
                          disabled={abrindoPacote || showAnimation}
                          className="bg-brasil-blue text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:scale-110 transition-transform"
                        >
                          Abrir Pacote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {(pacotesIniciais.length > 0 || !semNenhumPacote) && sectionDivider}
          </>
        )}

        {/* Pacotes de Boas-vindas */}
        {pacotesIniciais.length > 0 && (
          <>
            <div className={sectionBlock}>
              <h2 className={sectionTitle}>Pacotes de Boas-vindas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {pacotesIniciais.map((pacote) => (
                  <div key={pacote.id} className="relative group cursor-pointer bg-white/80 shadow-lg transform transition-all duration-300 scale-75 hover:scale-80" onClick={() => handleAbrirPacote(pacote.id)}>
                    <div className="relative w-full h-[300px] backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                      <Image src="/pacoteTransparente.png" alt="Pacote de Boas-vindas" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-4" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                        <button
                          disabled={abrindoPacote || showAnimation}
                          className="bg-brasil-green text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:scale-110 transition-transform"
                        >
                          Abrir Pacote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {!semNenhumPacote && sectionDivider}
          </>
        )}

        {/* Comprar Jogadores Desejados */}
        {!semNenhumPacote && (
          <>
            <div className={sectionBlockAlt}>
              <h2 className={sectionTitle}>Comprar Jogadores Desejados</h2>
              <div className="flex flex-col items-center w-full">
                <p className="bg-brasil-green/10 border-2 border-brasil-green text-brasil-green text-base md:text-lg font-bold rounded-xl px-8 py-5 shadow-lg max-w-3xl w-full text-center mb-8 mx-auto">
                  Colecione o jogador que você deseja sem depender da sorte, cole-o diretamente no seu álbum!
                </p>
                <ProdutosFigurinha 
                  produtos={
                    [...produtosFigurinha].sort((a, b) => {
                      const ordem: Record<string, number> = { 'Lendário': 0, 'lendário': 0, 'lendario': 0, 'Ouro': 1, 'ouro': 1, 'Prata': 2, 'prata': 2 };
                      const raridadeA = String(a.raridade).toLowerCase();
                      const raridadeB = String(b.raridade).toLowerCase();
                      return (ordem[raridadeA] ?? 3) - (ordem[raridadeB] ?? 3);
                    })
                  }
                  compraEmProgresso={compraEmProgresso}
                />
              </div>
            </div>
            <div className={sectionBlock}>
              <h2 className={sectionTitle}>Comprar Pacotes Extras</h2>
                <ul className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  {pacotesExtras.map((pacote) => {
                    const precoUnitario = pacote.valorCentavos / pacote.quantidade / 100;
                    const isTriplo = pacote.quantidade === 3;
                    return (
                      <li key={pacote.id} className={`flex-1 border-2 ${isTriplo ? 'border-yellow-500' : 'border-brasil-blue'} rounded-xl p-6 bg-white/90 shadow-lg flex flex-col items-center hover:shadow-2xl transition-shadow max-w-xs mx-auto min-w-[270px] min-h-[420px] relative ${isTriplo ? 'before:absolute before:inset-0 before:rounded-xl before:border-4 before:border-yellow-500/50 before:animate-pulse before:pointer-events-none' : ''}`}>
                        <div className="mb-4 flex justify-center items-center">
                          {pacote.quantidade === 1 && <Image src="/IndividualPremium.png" alt="1 pacote" width={120} height={120} />}
                          {pacote.quantidade === 2 && <Image src="/DuploPremium.png" alt="2 pacotes" width={120} height={120} />}
                          {pacote.quantidade === 3 && <Image src="/TriploPremium.png" alt="3 pacotes" width={120} height={120} />}
                        </div>
                        <div className="font-semibold text-lg mb-1 text-brasil-blue text-center">{pacote.nome}</div>
                        <div className="text-gray-600 mb-2 text-center">{pacote.descricao}</div>
                        <div className="text-brasil-blue font-bold text-xl mb-2 text-center">R$ {(pacote.valorCentavos / 100).toFixed(2)}</div>
                        {isTriplo ? (
                          <div className="text-brasil-green text-sm mb-2 text-center">
                            <span>Preço unitário do pacote: R$ {precoUnitario.toFixed(2)}</span><br />
                            <span className="font-bold">Preço por figurinha: R$ {(precoUnitario / 4).toFixed(2)}</span>
                            <div className="mt-1 inline-block bg-brasil-green/10 text-brasil-green px-2 py-1 rounded text-xs font-bold ml-2">Oferta mais vantajosa!</div>
                          </div>
                        ) : (
                          <div className="text-black text-sm mb-4 text-center">
                            <span>Preço unitário do pacote: R$ {precoUnitario.toFixed(2)}</span><br />
                            <span className="font-bold">Preço por figurinha: R$ {(precoUnitario / 4).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex-grow" />
                    <button
                      onClick={() => comprarPacote(pacote.id)}
                      disabled={loading}
                          className={`${isTriplo ? 'bg-gradient-to-r from-yellow-500 to-brasil-green hover:from-brasil-green hover:to-yellow-500' : 'bg-gradient-to-r from-brasil-yellow to-brasil-green hover:from-brasil-green hover:to-brasil-yellow'} text-brasil-blue px-8 py-3 rounded-lg font-bold shadow-lg transition-colors text-lg w-full mt-4`}
                    >
                      Comprar
                    </button>
                  </li>
                    );
                  })}
              </ul>
            </div>
          </>
        )}

        <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
          <PacoteAnimation
            isOpen={showAnimation}
            onAnimationComplete={handleAnimationComplete}
          />
        </Suspense>

        <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
          <ModalFigurinhas
            isOpen={modalAberto}
            onClose={handleFecharModal}
            figurinhas={figurinhasAbertas}
            userFigurinhas={userFigurinhas}
            onAbrirOutroPacote={handleAbrirOutroPacote}
            temMaisPacotes={pacotes.length > 0}
          />
        </Suspense>

        {jogador && (
          <ModalConfirmacaoCompra
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            jogador={jogador}
          />
        )}

        <Suspense fallback={null}>
        </Suspense>
      </main>
    </div>
  );
}

export default function PacotesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <PacotesContent />
    </Suspense>
  );
} 