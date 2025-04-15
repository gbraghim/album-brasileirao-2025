'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/Modal';

interface Figurinha {
  id: string;
  numero: number;
  nome: string;
  posicao: string;
  quantidade: number;
  time: {
    id: string;
    nome: string;
    escudo: string;
  };
}

interface Troca {
  id: string;
  figurinhaOferta: {
    id: string;
    jogador: {
      nome: string;
      posicao: string;
      numero: number;
    };
  };
  usuarioEnvia: {
    name: string;
    email: string;
  };
}

export default function Trocas() {
  const { data: session } = useSession();
  const [minhasTrocas, setMinhasTrocas] = useState<Troca[]>([]);
  const [trocasDisponiveis, setTrocasDisponiveis] = useState<Troca[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [figurinhasRepetidas, setFigurinhasRepetidas] = useState<Figurinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showProporTrocaModal, setShowProporTrocaModal] = useState(false);
  const [trocaSelecionada, setTrocaSelecionada] = useState<Troca | null>(null);

  useEffect(() => {
    if (session) {
      fetchTrocas();
      fetchFigurinhasRepetidas();
    }
  }, [session]);

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

      // Adicionar verificações e valores padrão
      const trocasFormatadas: Troca[] = (data.trocasDisponiveis || []).map((troca: any) => ({
        id: troca.id || '',
        status: troca.status || 'PENDENTE',
        figurinhaOferta: {
          id: troca.figurinha?.id || '',
          jogador: {
            id: troca.figurinha?.jogador?.id || '',
            nome: troca.figurinha?.jogador?.nome || '',
            posicao: troca.figurinha?.jogador?.posicao || '',
            numero: troca.figurinha?.jogador?.numero || 0,
            time: {
              id: troca.figurinha?.jogador?.time?.id || '',
              nome: troca.figurinha?.jogador?.time?.nome || '',
              escudo: troca.figurinha?.jogador?.time?.escudo || ''
            }
          }
        },
        usuarioEnvia: {
          id: troca.usuarioEnvia?.id || '',
          name: troca.usuarioEnvia?.name || '',
          email: troca.usuarioEnvia?.email || ''
        }
      }));

      const minhasTrocas = (data.minhasTrocas || []).map((troca: any) => ({
        id: troca.id || '',
        status: troca.status || 'PENDENTE',
        figurinhaOferta: {
          id: troca.figurinha?.id || '',
          jogador: {
            id: troca.figurinha?.jogador?.id || '',
            nome: troca.figurinha?.jogador?.nome || '',
            posicao: troca.figurinha?.jogador?.posicao || '',
            numero: troca.figurinha?.jogador?.numero || 0,
            time: {
              id: troca.figurinha?.jogador?.time?.id || '',
              nome: troca.figurinha?.jogador?.time?.nome || '',
              escudo: troca.figurinha?.jogador?.time?.escudo || ''
            }
          }
        },
        usuarioEnvia: {
          id: troca.usuarioEnvia?.id || '',
          name: troca.usuarioEnvia?.name || '',
          email: troca.usuarioEnvia?.email || ''
        }
      }));

      setMinhasTrocas(minhasTrocas);
      setTrocasDisponiveis(trocasFormatadas);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar trocas');
      setLoading(false);
    }
  };

  const fetchFigurinhasRepetidas = async () => {
    try {
      const response = await fetch('/api/repetidas');
      if (!response.ok) {
        throw new Error('Erro ao buscar figurinhas repetidas');
      }
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Dados inválidos recebidos da API:', data);
        setFigurinhasRepetidas([]);
        return;
      }

      setFigurinhasRepetidas(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar figurinhas repetidas:', error);
      setError('Erro ao carregar figurinhas repetidas');
      setFigurinhasRepetidas([]);
      setLoading(false);
    }
  };

  const adicionarTroca = async (figurinha: Figurinha) => {
    try {
      const response = await fetch('/api/trocas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ figurinhaId: figurinha.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar troca');
      }

      await fetchTrocas(); // Recarrega as trocas após adicionar uma nova
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao adicionar troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao adicionar troca');
    }
  };

  const handleProporTroca = async (figurinha: Figurinha) => {
    try {
      if (!trocaSelecionada) return;

      console.log('Iniciando handleProporTroca com figurinha:', figurinha);
      setLoading(true);
      setError(null);

      const response = await fetch('/api/trocas/propor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trocaId: trocaSelecionada.id,
          figurinhaId: figurinha.id
        }),
      });

      console.log('Resposta da API:', response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        throw new Error(errorData.error || 'Erro ao propor troca');
      }

      const data = await response.json();
      console.log('Dados da resposta:', data);

      // Atualizar a lista de trocas disponíveis
      setTrocasDisponiveis(trocasDisponiveis.filter(t => t.id !== trocaSelecionada.id));
      setSuccessMessage('Troca proposta com sucesso!');
      setShowSuccessModal(true);
      setShowProporTrocaModal(false);
      setTrocaSelecionada(null);
    } catch (error) {
      console.error('Erro ao propor troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao propor troca');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen  text-white p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Área de Trocas</h1>
        <p>Por favor, faça login para acessar a área de trocas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen  text-white p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Área de Trocas</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white p-8">
        <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Área de Trocas</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Área de Trocas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-r from-green-500 to-yellow-300 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Quero trocar</h2>
          <button
            onClick={() => setShowModal(true)}
            className="hover: text-white px-4 py-2 rounded-lg mb-4"
          >
            Adicionar figurinha para troca
          </button>
          <div className="grid grid-cols-2 gap-4">
            {minhasTrocas.map((troca) => (
              <div
                key={troca.id}
                className="bg-purple-700 p-4 rounded-lg"
              >
                <h3 className="font-bold">{troca.figurinhaOferta.jogador.nome}</h3>
                <p className="text-sm">{troca.figurinhaOferta.jogador.posicao}</p>
                <p className="text-xs">#{troca.figurinhaOferta.jogador.numero}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-yellow-300 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Trocas disponíveis</h2>
          <div className="grid grid-cols-2 gap-4">
            {trocasDisponiveis.map((troca) => (
              <div
                key={troca.id}
                className="bg-purple-700 p-4 rounded-lg"
              >
                <h3 className="font-bold">{troca.figurinhaOferta.jogador.nome}</h3>
                <p className="text-sm">{troca.figurinhaOferta.jogador.posicao}</p>
                <p className="text-xs">#{troca.figurinhaOferta.jogador.numero}</p>
                <p className="text-xs mt-2">De: {troca.usuarioEnvia.name}</p>
                <button
                  onClick={() => {
                    setTrocaSelecionada(troca);
                    setShowProporTrocaModal(true);
                  }}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Propor Troca
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de figurinhas repetidas */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-2xl font-bold mb-4">Escolha uma figurinha para troca</h2>
        <div className="grid grid-cols-2 gap-4">
          {figurinhasRepetidas.map((figurinha) => (
            <div
              key={figurinha.id}
              className="bg-purple-700 p-4 rounded-lg cursor-pointer hover:bg-purple-600"
              onClick={() => adicionarTroca(figurinha)}
            >
              <h3 className="font-bold">{figurinha.nome}</h3>
              <p className="text-sm">{figurinha.posicao}</p>
              <p className="text-xs">#{figurinha.numero}</p>
              <p className="text-xs mt-1">Repetidas: {figurinha.quantidade}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal de propor troca */}
      <Modal isOpen={showProporTrocaModal} onClose={() => {
        setShowProporTrocaModal(false);
        setTrocaSelecionada(null);
      }}>
        <h2 className="text-2xl font-bold mb-4">Escolha uma figurinha para propor troca</h2>
        <div className="grid grid-cols-2 gap-4">
          {figurinhasRepetidas.map((figurinha) => (
            <div
              key={figurinha.id}
              className="bg-purple-700 p-4 rounded-lg cursor-pointer hover:bg-purple-600"
              onClick={() => handleProporTroca(figurinha)}
            >
              <h3 className="font-bold">{figurinha.nome}</h3>
              <p className="text-sm">{figurinha.posicao}</p>
              <p className="text-xs">#{figurinha.numero}</p>
              <p className="text-xs mt-1">Repetidas: {figurinha.quantidade}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal de sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-black">{successMessage}</h2>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 