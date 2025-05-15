// Atualização: 2024-03-21 - Forçando novo deploy no Vercel
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/Modal';
import ModalProporTroca from '@/components/ModalProporTroca';
import { formatarCaminhoImagem } from '@/lib/utils';
import { TrocaStatus } from '@prisma/client';
import { Figurinha, Jogador } from '@/types';
import { toast } from 'react-hot-toast';
import Footer from '@/components/Footer';
import FigurinhaCard from '@/components/FigurinhaCard';
import { getCachedImage } from '@/lib/cache';
import { lazyLoadImage } from '@/lib/lazy-loading';
import Loading from '@/components/loading';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

interface Troca {
  id: string;
  figurinhaOferta: {
    id: string;
    jogador: Jogador;
    quantidade: number;
    raridade: string;
  };
  figurinhaSolicitada: {
    id: string;
    jogador: Jogador;
  };
  usuarioEnvia: {
    id: string;
    name: string;
  };
  usuarioRecebe: {
    id: string;
    name: string;
  };
  status: TrocaStatus;
  createdAt: string;
}

export default function Trocas() {
  const { data: session } = useSession();
  const [minhasTrocas, setMinhasTrocas] = useState<Troca[]>([]);
  const [trocasDisponiveis, setTrocasDisponiveis] = useState<Troca[]>([]);
  const [propostasRecebidas, setPropostasRecebidas] = useState<Troca[]>([]);
  const [ofertasEnviadas, setOfertasEnviadas] = useState<Troca[]>([]);
  const [repetidas, setRepetidas] = useState<Figurinha[]>([]);
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [figurinhasEmTroca, setFigurinhasEmTroca] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProporTrocaModal, setShowProporTrocaModal] = useState(false);
  const [trocaSelecionada, setTrocaSelecionada] = useState<Troca | null>(null);
  const [selectedFigurinha, setSelectedFigurinha] = useState<Figurinha | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingFigurinha, setLoadingFigurinha] = useState<string | null>(null);
  const [cachedEscudos, setCachedEscudos] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('1. Iniciando busca de dados...');
        const [repetidasResponse, trocasResponse] = await Promise.all([
          fetch('/api/repetidas'),
          fetch('/api/trocas')
        ]);

        console.log('2. Status das respostas:', {
          repetidas: repetidasResponse.status,
          trocas: trocasResponse.status
        });

        if (!repetidasResponse.ok || !trocasResponse.ok) {
          const errorData = await trocasResponse.json();
          throw new Error(errorData.error || 'Erro ao carregar dados');
        }

        const [repetidasData, trocasData] = await Promise.all([
          repetidasResponse.json(),
          trocasResponse.json()
        ]);

        console.log('3. Dados brutos recebidos:', {
          repetidas: repetidasData,
          trocas: trocasData
        });

        // Extrair IDs das figurinhas em troca
        console.log('4. Extraindo IDs das figurinhas em troca...');
        const figurinhasEmTrocaIds = new Set([
          ...(trocasData.minhasTrocas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
          ...(trocasData.trocasRecebidas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
          ...(trocasData.trocasDisponiveis || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
          ...(trocasData.ofertasEnviadas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean)
        ]);
        console.log('5. IDs das figurinhas em troca:', Array.from(figurinhasEmTrocaIds));
        setFigurinhasEmTroca(Array.from(figurinhasEmTrocaIds));

        // Formatar e atualizar as trocas
        console.log('6. Formatando trocas...');
        const formatarTroca = (troca: any) => ({
          id: troca.id || '',
          status: troca.status || 'PENDENTE',
          figurinhaOferta: {
            id: troca.figurinhaOferta?.id || '',
            jogador: {
              id: troca.figurinhaOferta?.jogador?.id || '',
              nome: troca.figurinhaOferta?.jogador?.nome || '',
              posicao: troca.figurinhaOferta?.jogador?.posicao || '',
              numero: troca.figurinhaOferta?.jogador?.numero || 0,
              nacionalidade: troca.figurinhaOferta?.jogador?.nacionalidade || '',
              foto: troca.figurinhaOferta?.jogador?.foto || '',
              raridade: troca.figurinhaOferta?.jogador?.raridade || 'COMUM',
              time: {
                id: troca.figurinhaOferta?.jogador?.time?.id || '',
                nome: troca.figurinhaOferta?.jogador?.time?.nome || '',
                escudo: troca.figurinhaOferta?.jogador?.time?.escudo || ''
              },
            },
            quantidade: troca.figurinhaOferta?.quantidade || 0,
            raridade: troca.figurinhaOferta?.jogador?.raridade || 'COMUM'
          },
          figurinhaSolicitada: {
            id: troca.figurinhaSolicitada?.id || '',
            jogador: {
              id: troca.figurinhaSolicitada?.jogador?.id || '',
              nome: troca.figurinhaSolicitada?.jogador?.nome || '',
              posicao: troca.figurinhaSolicitada?.jogador?.posicao || '',
              numero: troca.figurinhaSolicitada?.jogador?.numero || 0,
              nacionalidade: troca.figurinhaSolicitada?.jogador?.nacionalidade || '',
              foto: troca.figurinhaSolicitada?.jogador?.foto || '',
              raridade: troca.figurinhaSolicitada?.jogador?.raridade || 'COMUM',
              time: {
                id: troca.figurinhaSolicitada?.jogador?.time?.id || '',
                nome: troca.figurinhaSolicitada?.jogador?.time?.nome || '',
                escudo: troca.figurinhaSolicitada?.jogador?.time?.escudo || ''
              },
            }
          },
          usuarioEnvia: {
            id: troca.usuarioEnvia?.id || '',
            name: troca.usuarioEnvia?.name || ''
          },
          usuarioRecebe: {
            id: troca.usuarioRecebe?.id || '',
            name: troca.usuarioRecebe?.name || ''
          },
          createdAt: troca.createdAt || new Date().toISOString()
        });

        const minhasTrocasFormatadas = (trocasData.minhasTrocas || []).map(formatarTroca);
        const trocasRecebidasFormatadas = (trocasData.trocasRecebidas || []).map(formatarTroca);
        const trocasDisponiveisFormatadas = (trocasData.trocasDisponiveis || []).map(formatarTroca);
        const ofertasEnviadasFormatadas = (trocasData.ofertasEnviadas || []).map(formatarTroca);

        console.log('7. Trocas formatadas:', {
          minhasTrocas: minhasTrocasFormatadas.length,
          trocasRecebidas: trocasRecebidasFormatadas.length,
          trocasDisponiveis: trocasDisponiveisFormatadas.length,
          ofertasEnviadas: ofertasEnviadasFormatadas.length
        });

        setMinhasTrocas(minhasTrocasFormatadas);
        setPropostasRecebidas(trocasRecebidasFormatadas);
        setTrocasDisponiveis(trocasDisponiveisFormatadas);
        setOfertasEnviadas(ofertasEnviadasFormatadas);
        setRepetidas(repetidasData.map((f: any) => ({
          ...f,
          raridade: f.raridade || 'Prata'
        })));
        setTrocas(trocasData.trocas);
        setLoading(false);
        console.log('8. Estado atualizado:', {
          minhasTrocas: minhasTrocasFormatadas.length,
          trocasRecebidas: trocasRecebidasFormatadas.length,
          trocasDisponiveis: trocasDisponiveisFormatadas.length,
          ofertasEnviadas: ofertasEnviadasFormatadas.length,
          repetidas: repetidasData.length
        });
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    async function cacheEscudos() {
      const updates: Record<string, string> = {};
      const allTimes = [
        ...repetidas.map(f => f.jogador.time),
        ...minhasTrocas.map(t => t.figurinhaOferta.jogador.time),
        ...minhasTrocas.map(t => t.figurinhaSolicitada?.jogador?.time).filter(Boolean),
        ...trocasDisponiveis.map(t => t.figurinhaOferta.jogador.time),
        ...trocasDisponiveis.map(t => t.figurinhaSolicitada?.jogador?.time).filter(Boolean),
        ...propostasRecebidas.map(t => t.figurinhaOferta.jogador.time),
        ...propostasRecebidas.map(t => t.figurinhaSolicitada?.jogador?.time).filter(Boolean),
        ...ofertasEnviadas.map(t => t.figurinhaOferta.jogador.time),
        ...ofertasEnviadas.map(t => t.figurinhaSolicitada?.jogador?.time).filter(Boolean),
      ];
      for (const time of allTimes) {
        if (time && time.escudo && !updates[time.escudo]) {
          try {
            updates[time.escudo] = await getCachedImage(time.escudo);
          } catch {}
        }
      }
      setCachedEscudos(updates);
    }
    cacheEscudos();
  }, [repetidas, minhasTrocas, trocasDisponiveis, propostasRecebidas, ofertasEnviadas]);

  const fetchTrocas = async () => {
    try {
      const response = await fetch('/api/trocas');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar trocas');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Extrair IDs das figurinhas em troca
      const figurinhasEmTrocaIds = new Set([
        ...(data.minhasTrocas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
        ...(data.trocasRecebidas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
        ...(data.trocasDisponiveis || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean),
        ...(data.ofertasEnviadas || []).map((t: any) => t.figurinhaOferta?.id).filter(Boolean)
      ]);
      setFigurinhasEmTroca(Array.from(figurinhasEmTrocaIds));

      // Formatar e atualizar todas as trocas
      const formatarTroca = (troca: any) => ({
        id: troca.id || '',
        status: troca.status || 'PENDENTE',
        figurinhaOferta: {
          id: troca.figurinhaOferta?.id || '',
          jogador: {
            id: troca.figurinhaOferta?.jogador?.id || '',
            nome: troca.figurinhaOferta?.jogador?.nome || '',
            posicao: troca.figurinhaOferta?.jogador?.posicao || '',
            numero: troca.figurinhaOferta?.jogador?.numero || 0,
            nacionalidade: troca.figurinhaOferta?.jogador?.nacionalidade || '',
            foto: troca.figurinhaOferta?.jogador?.foto || '',
            raridade: troca.figurinhaOferta?.jogador?.raridade || 'COMUM',
            time: {
              id: troca.figurinhaOferta?.jogador?.time?.id || '',
              nome: troca.figurinhaOferta?.jogador?.time?.nome || '',
              escudo: troca.figurinhaOferta?.jogador?.time?.escudo || ''
            },
          },
          quantidade: troca.figurinhaOferta?.quantidade || 0,
          raridade: troca.figurinhaOferta?.jogador?.raridade || 'COMUM'
        },
        figurinhaSolicitada: troca.figurinhaSolicitada || null,
        usuarioEnvia: {
          id: troca.usuarioEnvia?.id || '',
          name: troca.usuarioEnvia?.name || '',
        },
        usuarioRecebe: troca.usuarioRecebe || { id: '', name: '' },
        createdAt: troca.createdAt || ''
      });

      const minhasTrocasFormatadas = (data.minhasTrocas || []).map(formatarTroca);
      const trocasRecebidasFormatadas = (data.trocasRecebidas || []).map(formatarTroca);
      const trocasDisponiveisFormatadas = (data.trocasDisponiveis || []).map(formatarTroca);
      const ofertasEnviadasFormatadas = (data.ofertasEnviadas || []).map(formatarTroca);

      setMinhasTrocas(minhasTrocasFormatadas);
      setPropostasRecebidas(trocasRecebidasFormatadas);
      setTrocasDisponiveis(trocasDisponiveisFormatadas);
      setOfertasEnviadas(ofertasEnviadasFormatadas);
      setTrocas(data.trocas);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar trocas');
      setLoading(false);
    }
  };

  const adicionarTroca = async (figurinha: Figurinha) => {
    setLoadingFigurinha(figurinha.id);
    try {
      const response = await fetch('/api/trocas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          figurinhaId: figurinha.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar troca');
      }

      // Recarrega as trocas e as repetidas
      const [repetidasResponse] = await Promise.all([
        fetch('/api/repetidas'),
        fetchTrocas()
      ]);

      if (!repetidasResponse.ok) {
        throw new Error('Erro ao atualizar repetidas');
      }

      const repetidasData = await repetidasResponse.json();
      setRepetidas(repetidasData);
      setFigurinhasEmTroca([...figurinhasEmTroca, figurinha.id]);
    } catch (error) {
      console.error('Erro ao adicionar troca:', error);
      if (error instanceof Error) {
        if (error.message.includes('Figurinha já está disponível para troca')) {
          setErrorMessage('Você já disponibilizou essa figurinha para troca. Remova a troca anterior para disponibilizar novamente.');
        } else if (error.message.includes('Figurinhas lendárias não podem ser trocadas')) {
          setErrorMessage('Figurinhas lendárias não podem ser trocadas.');
        } else {
          setErrorMessage('Erro ao adicionar troca: ' + error.message);
        }
      } else {
        setErrorMessage('Erro inesperado ao adicionar troca. Tente novamente.');
      }
      setShowErrorModal(true);
    } finally {
      setLoadingFigurinha(null);
    }
  };

  const handleProporTroca = async (figurinha: Figurinha): Promise<void> => {
    if (!trocaSelecionada) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/trocas/propor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trocaId: trocaSelecionada.id,
          figurinhaSolicitadaId: figurinha.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('Figurinha não encontrada ou não está disponível para troca')) {
          throw new Error('Você não possui essa figurinha repetida disponível para troca.');
        }
        throw new Error(errorData.error || 'Erro ao propor troca');
      }

      const data = await response.json();
      setTrocasDisponiveis(trocasDisponiveis.filter(t => t.id !== trocaSelecionada.id));
      setTrocaSelecionada(null);
      setFigurinhasEmTroca([...figurinhasEmTroca, figurinha.id]);
      
      // Recarregar as trocas
      await fetchTrocas();
      setSuccessMessage('Proposta de troca enviada com sucesso!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao propor troca:', error);
      if (error instanceof Error) {
        setErrorMessage('Erro ao propor troca: ' + error.message);
      } else {
        setErrorMessage('Erro inesperado ao propor troca. Tente novamente.');
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResponderTroca = async (trocaId: string, aceitar: 'aceitar' | 'recusar') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trocas/${trocaId}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: aceitar === 'aceitar' ? 'ACEITA' : 'RECUSADA' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Se a figurinha não estiver mais disponível, apenas recarrega as trocas
        if (errorData.error && (
          errorData.error.includes('não tem mais a figurinha ofertada disponível') ||
          errorData.error.includes('não tem mais a figurinha solicitada disponível')
        )) {
          await fetchTrocas();
          return;
        }
        // Para outros erros, mantém o comportamento atual
        if (errorData.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error('Erro ao responder à troca.');
        }
      }

      setSuccessMessage(aceitar === 'aceitar' ? 'Troca aceita com sucesso!' : 'Troca recusada com sucesso!');
      setShowSuccessModal(true);
      await fetchTrocas();
      if (aceitar === 'aceitar') {
        window.location.reload();
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erro inesperado ao responder à troca. Tente novamente.');
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const removerTroca = async (figurinhaId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/trocas/remover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ figurinhaId }),
      });

      if (!response.ok && response.status !== 404) {
        toast.error('Erro ao remover troca');
        throw new Error('Erro ao remover troca');
      }

      // Remove localmente a troca da lista
      setMinhasTrocas((prev) => prev.filter((troca) => troca.figurinhaOferta.id !== figurinhaId));
      setFigurinhasEmTroca((prev) => prev.filter((id) => id !== figurinhaId));
      // Atualiza a lista de figurinhas repetidas
      const repetidasResponse = await fetch('/api/repetidas');
      if (repetidasResponse.ok) {
        const repetidasData = await repetidasResponse.json();
        setRepetidas(repetidasData.map((f: any) => ({
          ...f,
          raridade: f.raridade || 'Prata'
        })));
      }
      // Dispara um evento personalizado para notificar outras páginas
      const event = new CustomEvent('trocaRemovida', { detail: { figurinhaId } });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Erro ao remover troca:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função utilitária para normalizar strings (remover acentos e deixar minúsculo)
  function normalize(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Função para definir a cor da borda de acordo com a raridade
  function getRaridadeStyle(raridade: string) {
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
  }

  // Adicionar função para retornar a cor da label de raridade
  function getRaridadeLabelStyle(raridade: string) {
    switch (raridade) {
      case 'Lendário':
        return 'bg-purple-600 text-white';
      case 'Ouro':
        return 'bg-yellow-500 text-yellow-900';
      case 'Prata':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  }

  // Função para renderizar uma figurinha usando o FigurinhaCard
  const renderFigurinha = (figurinha: any, emTroca: boolean = false) => {
    return (
      <FigurinhaCard
        jogador={{
          id: figurinha.jogador.id,
          nome: figurinha.jogador.nome,
          numero: figurinha.jogador.numero,
          posicao: figurinha.jogador.posicao,
          nacionalidade: figurinha.jogador.nacionalidade,
          time: {
            id: figurinha.jogador.time.id,
            nome: figurinha.jogador.time.nome,
            escudo: cachedEscudos[figurinha.jogador.time.escudo] || figurinha.jogador.time.escudo
          },
          raridade: figurinha.raridade
        }}
        jogadorColetado={true}
        currentImageIndex={0}
        onImageError={() => {}}
      />
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen text-white p-8">
        <Suspense fallback={<Loading />}>
          <Loading />
        </Suspense>
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Área de Trocas</h1>
        <p>Por favor, faça login para acessar a área de trocas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
        <Suspense fallback={<Loading />}>
          <Loading />
        </Suspense>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Carregando...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 text-white p-4 md:p-8">
        <Suspense fallback={<Loading />}>
          <Loading />
        </Suspense>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue">Erro</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Suspense fallback={<Loading />}>
      </Suspense>
      <main>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-brasil-blue">Trocas</h1>

          {/* Minhas Figurinhas Repetidas */}
          <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
            <h2 className="text-xl font-bold mb-6 text-brasil-blue flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Minhas Figurinhas Repetidas
            </h2>
            {repetidas.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-brasil-blue/5 to-brasil-yellow/5 rounded-lg border border-brasil-blue/20">
                <p className="text-brasil-blue text-lg font-semibold mb-2">Que pena! Você ainda não tem figurinhas repetidas para troca.</p>
                <p className="text-brasil-blue/80 mb-4">Mas não se preocupe, você pode conseguir mais figurinhas comprando pacotes!</p>
                <Link 
                  href="/pacotes" 
                  className="inline-flex items-center gap-2 bg-brasil-blue hover:bg-brasil-blue/90 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Comprar Pacotes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {(() => {
                  // Obter todos os jogadores envolvidos em propostas pendentes (tanto recebidas quanto enviadas)
                  const jogadoresEmPropostaPendente = new Set<string>();
                  
                  // Verificar propostas recebidas
                  propostasRecebidas.forEach((troca) => {
                    if (troca.status === 'PENDENTE') {
                      if (troca.figurinhaSolicitada?.jogador?.id) {
                        jogadoresEmPropostaPendente.add(troca.figurinhaSolicitada.jogador.id);
                      }
                      if (troca.figurinhaOferta?.jogador?.id) {
                        jogadoresEmPropostaPendente.add(troca.figurinhaOferta.jogador.id);
                      }
                    }
                  });

                  // Verificar ofertas enviadas
                  ofertasEnviadas.forEach((troca) => {
                    if (troca.status === 'PENDENTE') {
                      if (troca.figurinhaSolicitada?.jogador?.id) {
                        jogadoresEmPropostaPendente.add(troca.figurinhaSolicitada.jogador.id);
                      }
                      if (troca.figurinhaOferta?.jogador?.id) {
                        jogadoresEmPropostaPendente.add(troca.figurinhaOferta.jogador.id);
                      }
                    }
                  });

                  // Mostrar todas as figurinhas, mas desabilitar o botão para as que estão em proposta pendente
                  return repetidas.map((figurinha) => (
                    <div key={figurinha.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-0 flex flex-col items-center min-w-0 w-36 mx-auto">
                      {renderFigurinha(figurinha)}
                      <div className="flex flex-col items-center justify-center mt-3 w-full px-2">
                        {figurinha.jogador.time.escudo && (
                          <Image
                            src={cachedEscudos[figurinha.jogador.time.escudo] || figurinha.jogador.time.escudo}
                            alt={figurinha.jogador.time.nome}
                            width={18}
                            height={18}
                            className="w-4 h-4"
                          />
                        )}
                        <span className="text-xs text-gray-600 truncate text-center w-full">{figurinha.jogador.time.nome}</span>
                      </div>
                      <div className="mt-0.5 flex flex-col items-center w-full px-2">
                        <span className="text-xs text-gray-600 truncate max-w-[110px] text-center w-full">{figurinha.jogador.nome}</span>
                        <span className="text-xs font-semibold text-brasil-blue">Repetida(s): {figurinha.quantidade - 1}</span>
                      </div>
                      <div className="flex justify-between items-center mt-0.5 w-full px-2">
                        {normalize(figurinha.raridade) === 'lendario' ? (
                          <span className="text-xs text-gray-500 text-center italic w-full">Figurinha lendária não pode ser trocada</span>
                        ) : jogadoresEmPropostaPendente.has(figurinha.jogador.id) ? (
                          <div className="w-full bg-gray-100 text-gray-500 py-1 px-1 rounded text-xs h-9 min-h-0 flex items-center justify-center gap-1 cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Em proposta pendente
                          </div>
                        ) : (
                          <>
                            {!figurinhasEmTroca.includes(figurinha.id) && (
                              <button
                                onClick={() => adicionarTroca(figurinha)}
                                className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow py-1 px-1 rounded text-xs h-9 min-h-0 transition-colors duration-300 flex items-center justify-center gap-1"
                                disabled={loadingFigurinha === figurinha.id}
                              >
                                {loadingFigurinha === figurinha.id ? (
                                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                  </svg>
                                ) : null}
                                Disponibilizar para troca
                              </button>
                            )}
                            {figurinhasEmTroca.includes(figurinha.id) && (
                              <button
                                onClick={() => removerTroca(figurinha.id)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-1 rounded text-xs h-7 min-h-0 transition-colors duration-300 flex items-center justify-center gap-1"
                                disabled={loadingFigurinha === figurinha.id}
                              >
                                {loadingFigurinha === figurinha.id ? (
                                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                  </svg>
                                ) : null}
                                Remover
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Trocas Disponíveis */}
          <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
            <h2 className="text-xl font-bold mb-6 text-brasil-blue flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Trocas Disponíveis
            </h2>
            <div className="mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <span className="text-xs text-gray-500">Apenas figurinhas que você ainda não colecionou são exibidas aqui.</span>
            </div>
            {trocasDisponiveis.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-brasil-blue/5 to-brasil-yellow/5 rounded-lg border border-brasil-blue/20">
                <p className="text-brasil-blue text-lg font-semibold mb-2">Não há trocas disponíveis no momento.</p>
                <p className="text-brasil-blue/80">Volte mais tarde para ver novas propostas de troca!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                {trocasDisponiveis
                  .filter((troca: Troca) => troca.usuarioEnvia.id !== session?.user?.id)
                  .map((troca) => (
                    <div key={troca.id} className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4 flex flex-col items-center justify-center">
                      {renderFigurinha(troca.figurinhaOferta)}
                      <span className="block text-xs text-gray-500 mt-2 mb-1">Oferecido por <span className="font-semibold text-brasil-blue">{troca.usuarioEnvia.name}</span></span>
                      <div className="flex items-center gap-2 mb-1">
                        {troca.figurinhaOferta.jogador.time.escudo && (
                          <Image
                            src={cachedEscudos[troca.figurinhaOferta.jogador.time.escudo] || troca.figurinhaOferta.jogador.time.escudo}
                            alt={troca.figurinhaOferta.jogador.time.nome}
                            width={18}
                            height={18}
                            className="w-4 h-4"
                          />
                        )}
                        <span className="text-xs text-gray-600">{troca.figurinhaOferta.jogador.time.nome}</span>
                      </div>
                      <div className="mt-0.5 flex justify-between items-center w-full px-2">
                        {repetidas.length === 0 ? (
                          <Link 
                            href="/pacotes" 
                            className="w-full bg-brasil-blue/10 hover:bg-brasil-blue/20 text-brasil-blue py-1 px-1 rounded text-xs h-9 min-h-0 transition-colors duration-300 flex items-center justify-center gap-1"
                          >
                            Obtenha pacotes para ter figurinhas para troca
                          </Link>
                        ) : (
                          <div className="w-full flex justify-center">
                            <button
                              onClick={() => {
                                setTrocaSelecionada(troca);
                                setShowProporTrocaModal(true);
                              }}
                              className="w-32 bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow py-1 px-1 rounded text-xs h-9 min-h-0 transition-colors duration-300 flex items-center justify-center gap-1"
                            >
                              Propor Troca
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Propostas Pendentes */}
          <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
            <h2 className="text-xl font-bold mb-6 text-brasil-blue flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Propostas Pendentes
            </h2>
            {ofertasEnviadas.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-brasil-blue/5 to-brasil-yellow/5 rounded-lg border border-brasil-blue/20">
                <p className="text-brasil-blue text-lg font-semibold mb-2">Você ainda não enviou nenhuma proposta de troca.</p>
                <p className="text-brasil-blue/80">Quando você propor uma troca, ela aparecerá aqui até ser aceita ou recusada.</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                {ofertasEnviadas.map((troca, idx) => (
                  <div key={troca.id} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 overflow-visible border-4 border-yellow-400 mb-8 ${idx === ofertasEnviadas.length - 1 ? '' : 'mt-2'}`}>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      {/* Figurinha Ofertada */}
                      <div className="flex-1 min-w-[140px] max-w-[170px] flex flex-col items-center">
                        <span className="block text-xs font-semibold text-gray-500 mb-1">Você quer</span>
                        <div className={`relative w-32 h-100 rounded-lg overflow-hidden border-4 ${getRaridadeStyle(troca.figurinhaOferta.jogador.raridade)} shadow-[0_0_10px_rgba(255,215,0,0.3)] hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-shadow duration-300`} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {renderFigurinha({...troca.figurinhaOferta, size: 'lg', hideName: true})}
                        </div>
                        <span className="block text-xs text-gray-500 mt-2 mb-1">Oferecido por <span className="font-semibold text-brasil-blue">{troca.usuarioEnvia.name}</span></span>
                        <div className="flex items-center space-x-2 mt-2 mb-1">
                          {troca.figurinhaOferta.jogador.time.escudo && (
                            <Image
                              src={cachedEscudos[troca.figurinhaOferta.jogador.time.escudo] || troca.figurinhaOferta.jogador.time.escudo}
                              alt={troca.figurinhaOferta.jogador.time.nome}
                              width={24}
                              height={24}
                              className="w-6 h-6"
                            />
                          )}
                          <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.time.nome}</span>
                        </div>
                        <div className="flex flex-col items-center w-full">
                          <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.nome}</span>
                        </div>
                      </div>

                      {/* Seta de troca */}
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brasil-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>

                      {/* Figurinha Solicitada */}
                      <div className="flex-1 min-w-[140px] max-w-[170px] flex flex-col items-center">
                        <span className="block text-xs font-semibold text-gray-500 mb-1">Você ofereceu</span>
                        <div className={`relative w-32 h-100 rounded-lg overflow-hidden border-4 ${getRaridadeStyle(troca.figurinhaSolicitada.jogador.raridade)}`} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {renderFigurinha({...troca.figurinhaSolicitada, size: 'lg', hideName: true})}
                        </div>
                        <span className="block text-xs text-gray-500 mt-2 mb-1">Oferecido por <span className="font-semibold text-brasil-blue">{troca.usuarioRecebe.name}</span></span>
                        <div className="flex items-center space-x-2 mt-2 mb-1">
                          {troca.figurinhaSolicitada.jogador.time.escudo && (
                            <Image
                              src={cachedEscudos[troca.figurinhaSolicitada.jogador.time.escudo] || troca.figurinhaSolicitada.jogador.time.escudo}
                              alt={troca.figurinhaSolicitada.jogador.time.nome}
                              width={24}
                              height={24}
                              className="w-6 h-6"
                            />
                          )}
                          <span className="text-sm text-gray-600">{troca.figurinhaSolicitada.jogador.time.nome}</span>
                        </div>
                        <div className="flex flex-col items-center w-full">
                          <span className="text-sm text-gray-600">{troca.figurinhaSolicitada.jogador.nome}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status e ação */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
                      <span className="text-sm font-semibold text-brasil-blue">Status: {troca.status === 'PENDENTE' ? 'Pendente' : troca.status === 'RECUSADA' ? 'Recusada' : 'Aceita'}</span>
                      {troca.status === 'PENDENTE' && (
                        <button
                          className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-colors"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/trocas/cancelar`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ trocaId: troca.id })
                              });
                              if (!res.ok) throw new Error('Erro ao cancelar proposta');
                              // Atualiza a lista de trocas após cancelar
                              await fetchTrocas();
                            } catch (err) {
                              setError('Erro ao cancelar proposta');
                              setShowErrorModal(true);
                            }
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Propostas Recebidas */}
          <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
            <h2 className="text-xl font-bold mb-6 text-brasil-blue flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Propostas Recebidas
            </h2>
            {propostasRecebidas.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-brasil-blue/5 to-brasil-yellow/5 rounded-lg border border-brasil-blue/20">
                <p className="text-brasil-blue text-lg font-semibold mb-2">Você ainda não recebeu nenhuma proposta de troca.</p>
                <p className="text-brasil-blue/80">Quando alguém se interessar por suas figurinhas, as propostas aparecerão aqui!</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                {propostasRecebidas.map((troca, idx) => (
                  <div key={troca.id} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 overflow-visible border-4 border-blue mb-8 ${idx === propostasRecebidas.length - 1 ? '' : 'mt-2'}`}>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      {/* Figurinha Ofertada */}
                      <div className="flex-1 min-w-[140px] max-w-[170px] flex flex-col items-center">
                        <span className="block text-xs font-semibold text-gray-500 mb-1">Você tem</span>
                        <div className={`relative w-32 h-100 rounded-lg overflow-hidden border-4 ${getRaridadeStyle(troca.figurinhaOferta.jogador.raridade)}`} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {renderFigurinha({...troca.figurinhaOferta, size: 'lg', hideName: true})}
                        </div>
                        <span className="block text-xs text-gray-500 mt-2 mb-1">Oferecido por <span className="font-semibold text-brasil-blue">{troca.usuarioEnvia.name}</span></span>
                        <div className="flex items-center space-x-2 mt-2 mb-1">
                          {troca.figurinhaOferta.jogador.time.escudo && (
                            <Image
                              src={cachedEscudos[troca.figurinhaOferta.jogador.time.escudo] || troca.figurinhaOferta.jogador.time.escudo}
                              alt={troca.figurinhaOferta.jogador.time.nome}
                              width={24}
                              height={24}
                              className="w-6 h-6"
                            />
                          )}
                          <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.time.nome}</span>
                        </div>
                        <div className="flex flex-col items-center w-full">
                          <span className="text-sm text-gray-600">{troca.figurinhaOferta.jogador.nome}</span>
                        </div>
                      </div>

                      {/* Seta de troca */}
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brasil-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>

                      {/* Figurinha Solicitada */}
                      <div className="flex-1 min-w-[140px] max-w-[170px] flex flex-col items-center">
                        <span className="block text-xs font-semibold text-gray-500 mb-1">Você ganhará</span>
                        <div className={`relative w-32 h-100 rounded-lg overflow-hidden border-4 ${getRaridadeStyle(troca.figurinhaSolicitada.jogador.raridade)}`} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {renderFigurinha({...troca.figurinhaSolicitada, size: 'lg', hideName: true})}
                        </div>
                        <span className="block text-xs text-gray-500 mt-2 mb-1">Oferecido por <span className="font-semibold text-brasil-blue">{troca.usuarioRecebe.name}</span></span>
                        <div className="flex items-center space-x-2 mt-2 mb-1">
                          {troca.figurinhaSolicitada.jogador.time.escudo && (
                            <Image
                              src={cachedEscudos[troca.figurinhaSolicitada.jogador.time.escudo] || troca.figurinhaSolicitada.jogador.time.escudo}
                              alt={troca.figurinhaSolicitada.jogador.time.nome}
                              width={24}
                              height={24}
                              className="w-6 h-6"
                            />
                          )}
                          <span className="text-sm text-gray-600">{troca.figurinhaSolicitada.jogador.time.nome}</span>
                        </div>
                        <div className="flex flex-col items-center w-full">
                          <span className="text-sm text-gray-600">{troca.figurinhaSolicitada.jogador.nome}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => handleResponderTroca(troca.id, 'aceitar')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleResponderTroca(troca.id, 'recusar')}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modais */}
      {showProporTrocaModal && trocaSelecionada && (
        <Suspense fallback={<Loading />}>
          <ModalProporTroca
            isOpen={showProporTrocaModal}
            onClose={() => {
              setShowProporTrocaModal(false);
              setTrocaSelecionada(null);
            }}
            troca={trocaSelecionada}
            onProporTroca={handleProporTroca}
            figurinhasRepetidas={repetidas}
            figurinhasEmPropostaPendente={Array.from(new Set([
              ...propostasRecebidas.filter(t => t.status === 'PENDENTE').map(t => t.figurinhaSolicitada?.jogador?.id),
              ...ofertasEnviadas.filter(t => t.status === 'PENDENTE').map(t => t.figurinhaSolicitada?.jogador?.id)
            ]))}
          />
        </Suspense>
      )}

      {showErrorModal && (
        <Suspense fallback={<Loading />}>
          <Modal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            title="Erro"
          >
            <div className="text-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-600 font-semibold">{errorMessage}</p>
            </div>
          </Modal>
        </Suspense>
      )}

      {showSuccessModal && (
        <Suspense fallback={<Loading />}>
          <Modal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title="Sucesso!"
          >
            <div className="text-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-600 font-semibold">{successMessage}</p>
            </div>
          </Modal>
        </Suspense>
      )}
    </div>
  );
} 