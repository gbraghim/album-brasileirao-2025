'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Pacote as PacoteType } from '@/types/pacote';

interface Pacote extends PacoteType {
  // Adicione propriedades adicionais específicas desta página, se necessário
}

interface Jogador {
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

export default function Pacotes() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      carregarPacotes();
      carregarFigurinhasUsuario();
      // Exibir modal de boas-vindas apenas na primeira visita
      if (typeof window !== 'undefined' && session?.user?.email) {
        const key = `welcomeModalShown_${session.user.email}`;
        if (!localStorage.getItem(key)) {
          setShowWelcomeModal(true);
          localStorage.setItem(key, 'true');
        } else {
          setShowWelcomeModal(false);
        }
      }
    }
    // Carregar pacotes premium
    fetch('/api/pacotes-preco')
      .then(res => res.json())
      .then(data => setPacotesPremium(data));
  }, [status, router, session?.user?.email]);

  const carregarFigurinhasUsuario = async () => {
    try {
      const response = await fetch('/api/meu-album', {
        headers: {
          'Authorization': `Bearer ${session?.user?.email}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as AlbumResponse;
        const figurinhasIds = new Set<string>();
        
        data.jogadores.forEach(jogador => {
          jogador.figurinhas?.forEach(figurinha => {
            figurinhasIds.add(figurinha.id);
          });
        });
        
        setUserFigurinhas(figurinhasIds);
      }
    } catch (err) {
      console.error('Erro ao carregar figurinhas do usuário:', err);
    }
  };

  const carregarPacotes = async () => {
    try {
      if (!session?.user?.email) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/pacotes', {
        headers: {
          'Authorization': `Bearer ${session.user.email}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Erro ao carregar pacotes';
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      setPacotes(data.filter((pacote: any) => !pacote.aberto));
    } catch (err) {
      console.error('Erro ao carregar pacotes:', err);
      setError('Ocorreu um erro ao carregar os pacotes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirPacote = async (pacoteId: string) => {
    if (abrindoPacote || showAnimation) return;
    setAbrindoPacote(true);
    setShowAnimation(true);
    try {
      setPacoteAbrindo(pacoteId);
      const response = await fetch('/api/pacotes/abrir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.email}`,
        },
        body: JSON.stringify({ pacoteId }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          setShowAnimation(false);
          setAbrindoPacote(false);
          return;
        }
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Erro ao abrir pacote';
        setError(errorMessage);
        setShowAnimation(false);
        setAbrindoPacote(false);
        return;
      }
      const data = await response.json();
      setFigurinhasAbertas(data.figurinhas);
      carregarPacotes();
    } catch (err) {
      console.error('Erro ao abrir pacote:', err);
      setError('Ocorreu um erro ao abrir o pacote. Tente novamente mais tarde.');
      setShowAnimation(false);
    } finally {
      setPacoteAbrindo(null);
      setAbrindoPacote(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    carregarFigurinhasUsuario();
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
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pacoteId, userId: session.user.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Erro ao iniciar pagamento');
    }
  };

  // Separar pacotes por tipo
  const pacotesDiarios = pacotes.filter(p => p.tipo === 'DIARIO');
  const pacotesIniciais = pacotes.filter(p => p.tipo === 'INICIAL');
  const pacotesPremiumUser = pacotes.filter(p => p.tipo === 'COMPRADO');

  const semPacotesDisponiveis =
    pacotesDiarios.length === 0 &&
    pacotesIniciais.length === 0 &&
    pacotesPremiumUser.length === 0;

  // Ao fechar o modal, garantir que ele não volte a aparecer
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    if (typeof window !== 'undefined' && session?.user?.email) {
      const key = `welcomeModalShown_${session.user.email}`;
      localStorage.setItem(key, 'true');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
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
          {semPacotesDisponiveis && (
            <div className="mt-0 mb-8 p-4 md:p-6  rounded-lg  mx-4 md:mx-6">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-brasil-blue mb-4">Comprar Pacotes</h2>
                <ul className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  {pacotesPremium.map((pacote) => {
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
                          <div className="text-brasil-green font-bold text-sm mb-2 text-center">
                            Preço unitário: R$ {precoUnitario.toFixed(2)}
                            <div className="mt-1 inline-block bg-brasil-green/10 text-brasil-green px-2 py-1 rounded text-xs font-bold ml-2">Oferta mais vantajosa!</div>
                          </div>
                        ) : (
                          <div className="text-black font-bold text-sm mb-4 text-center">Preço unitário: R$ {precoUnitario.toFixed(2)}</div>
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
            </div>
          )}

          <h1 className="text-2xl text-center md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue px-4 md:px-6">Meus Pacotes</h1>

          {/* Seção Pacotes Diários */}
          <div className="mb-12">
            <h2 className="text-2xl text-center font-bold text-brasil-blue mb-2">Pacotes Diários</h2>
            {pacotesDiarios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pacotesDiarios.map((pacote) => (
                  <div key={pacote.id} className="relative group cursor-pointer shadow-lg transform transition-all duration-300 hover:scale-105" onClick={() => handleAbrirPacote(pacote.id)}>
                    <div className="relative w-full h-[300px] backdrop-blur-sm rounded-lg  overflow-hidden">
                      <Image src="/pacoteTransparente.png" alt="Pacote Diário" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
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
            ) : <p className="text-brasil-blue">Você não tem pacotes diários disponíveis.</p>}
          </div>

          {/* Seção Pacotes de Boas-vindas */}
          <div className="mb-12">
            <h2 className="text-2xl text-center font-bold text-brasil-blue mb-2">Pacotes de Boas-vindas</h2>
            {pacotesIniciais.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pacotesIniciais.map((pacote) => (
                  <div key={pacote.id} className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handleAbrirPacote(pacote.id)}>
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
            ) : <p className="text-brasil-blue">Você já abriu seus pacotes de boas-vindas, adquira mais pacotes para completar seu álbum!</p>}
          </div>

          {/* Seção Pacotes Premium */}
          <div className="mb-8">
            <h2 className="text-2xl text-center font-bold text-brasil-blue mb-2">Pacotes Premium</h2>
            {pacotesPremiumUser.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pacotesPremiumUser.map((pacote) => (
                  <div key={pacote.id} className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handleAbrirPacote(pacote.id)}>
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
            ) : <p className="text-brasil-blue">Você não tem pacotes premium disponíveis.</p>}
          </div>

          {/* Seção Comprar Pacotes Premium repaginada */}
          {!semPacotesDisponiveis && (
          <div className="mt-8 p-4 md:p-6  rounded-lg shadow-sm mx-4 md:mx-6">
            <div className="text-center">
                <h2 className="text-2xl text-center md:text-2xl font-bold text-brasil-blue mb-4">Comprar Pacotes</h2>
                <ul className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  {pacotesPremium.map((pacote) => {
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
                          <div className="text-brasil-green font-bold text-sm mb-2 text-center">
                            Preço unitário: R$ {precoUnitario.toFixed(2)}
                            <div className="mt-1 inline-block bg-brasil-green/10 text-brasil-green px-2 py-1 rounded text-xs font-bold ml-2">Oferta mais vantajosa!</div>
                          </div>
                        ) : (
                          <div className="text-black font-bold text-sm mb-4 text-center">Preço unitário: R$ {precoUnitario.toFixed(2)}</div>
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
          </div>
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

          <Suspense fallback={null}>
          </Suspense>
        </div>
      </main>
    </div>
  );
} 