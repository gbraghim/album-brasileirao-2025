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
  time?: {
    id: string;
    nome: string;
    escudo: string;
  };
}

interface Troca {
  id: string;
  figurinha: {
    id: string;
    jogador: {
      id: string;
      nome: string;
      posicao: string;
      numero: number;
      foto: string;
      time: {
        id: string;
        nome: string;
        escudo: string;
      };
    };
  };
  usuarioEnvia: {
    name: string;
    email: string;
  };
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA';
}

export default function Trocas() {
  const { data: session } = useSession();
  const [minhasTrocas, setMinhasTrocas] = useState<Troca[]>([]);
  const [trocasDisponiveis, setTrocasDisponiveis] = useState<Troca[]>([]);
  const [propostasRecebidas, setPropostasRecebidas] = useState<Troca[]>([]);
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
      setMinhasTrocas(data.minhasTrocas || []);
      setTrocasDisponiveis(data.trocasDisponiveis || []);
      setPropostasRecebidas(data.propostasRecebidas || []);
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar figurinhas repetidas');
      }
      const data = await response.json();
      console.log('Dados recebidos da API de repetidas:', data);

      if (!data) {
        throw new Error('Nenhum dado recebido da API');
      }

      const figurinhas = Array.isArray(data) ? data : [];
      console.log('Figurinhas formatadas:', figurinhas);

      setFigurinhasRepetidas(figurinhas.map((figurinha: any) => ({
        id: figurinha.id,
        numero: figurinha.numero || 0,
        nome: figurinha.nome,
        posicao: figurinha.posicao,
        quantidade: figurinha.quantidade,
        time: figurinha.time
      })));
    } catch (error) {
      console.error('Erro ao carregar figurinhas repetidas:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar figurinhas repetidas');
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

      await fetchTrocas();
      setShowModal(false);
      setSuccessMessage('Figurinha disponibilizada para troca com sucesso!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao adicionar troca:', error);
      setError(error instanceof Error ? error.message : 'Erro ao adicionar troca');
    }
  };

  const handleProporTroca = async (figurinha: Figurinha) => {
    try {
      if (!trocaSelecionada) return;

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao propor troca');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

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

  const responderProposta = async (trocaId: string, aceitar: boolean) => {
    try {
      const response = await fetch('/api/trocas/responder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trocaId, aceitar }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao responder proposta');
      }

      await fetchTrocas();
      setSuccessMessage(aceitar ? 'Proposta aceita com sucesso!' : 'Proposta recusada com sucesso!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao responder proposta:', error);
      setError(error instanceof Error ? error.message : 'Erro ao responder proposta');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>
        <p>Por favor, faça login para acessar a área de trocas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Área de Trocas</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Seção "Gestão de propostas de troca" */}
        <div className="bg-purple-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Gestão de propostas de troca</h2>
          {propostasRecebidas.length === 0 ? (
            <p className="text-gray-300">Você não tem propostas de troca pendentes.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propostasRecebidas.map((proposta) => (
                <div key={proposta.id} className="bg-purple-700 p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16">
                      <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${proposta.figurinha.jogador.nome}-${proposta.figurinha.jogador.numero}`}
                        alt={proposta.figurinha.jogador.nome}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{proposta.figurinha.jogador.nome}</h3>
                      <p className="text-sm text-purple-200">
                        {proposta.figurinha.jogador.posicao} - Nº {proposta.figurinha.jogador.numero}
                      </p>
                      <p className="text-sm text-purple-200">De: {proposta.usuarioEnvia.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => responderProposta(proposta.id, true)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => responderProposta(proposta.id, false)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção "Quero trocar" */}
        <div className="bg-purple-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Quero trocar</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mb-4"
          >
            Adicionar figurinha para troca
          </button>
          <div className="grid grid-cols-2 gap-4">
            {minhasTrocas.map((troca) => (
              <div
                key={troca.id}
                className="bg-purple-700 p-4 rounded-lg"
              >
                <h3 className="font-bold">{troca.figurinha.jogador.nome}</h3>
                <p className="text-sm">{troca.figurinha.jogador.posicao}</p>
                <p className="text-xs">#{troca.figurinha.jogador.numero}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção "Trocas disponíveis" */}
        <div className="bg-purple-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Trocas disponíveis</h2>
          <div className="grid grid-cols-2 gap-4">
            {trocasDisponiveis.map((troca) => (
              <div
                key={troca.id}
                className="bg-purple-700 p-4 rounded-lg"
              >
                <h3 className="font-bold">{troca.figurinha.jogador.nome}</h3>
                <p className="text-sm">{troca.figurinha.jogador.posicao}</p>
                <p className="text-xs">#{troca.figurinha.jogador.numero}</p>
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
      <Modal 
        isOpen={showProporTrocaModal} 
        onClose={() => {
          setShowProporTrocaModal(false);
          setTrocaSelecionada(null);
        }}
        title="Escolha uma figurinha para propor troca"
      >
        <div className="p-4">
          {figurinhasRepetidas.length === 0 ? (
            <p className="text-center text-gray-300">Você não tem figurinhas repetidas disponíveis para troca.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {figurinhasRepetidas.map((figurinha) => (
                <div
                  key={figurinha.id}
                  className="bg-purple-700 p-4 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors"
                  onClick={() => handleProporTroca(figurinha)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${figurinha.nome}-${figurinha.numero}`}
                        alt={figurinha.nome}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{figurinha.nome}</h3>
                      <p className="text-sm text-purple-200">
                        {figurinha.posicao} - Nº {figurinha.numero}
                      </p>
                      <p className="text-sm text-purple-200">
                        Quantidade: {figurinha.quantidade}
                      </p>
                      {figurinha.time && (
                        <p className="text-sm text-purple-200">
                          Time: {figurinha.time.nome}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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