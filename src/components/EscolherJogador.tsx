import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatarCaminhoImagem } from '@/lib/utils';

interface Jogador {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  nacionalidade: string;
  time: {
    id: string;
    nome: string;
    escudo: string;
  };
  raridade: string;
}

interface EscolherJogadorProps {
  compraId: string;
  raridade: string;
  onJogadorEscolhido: () => void;
}

export default function EscolherJogador({
  compraId,
  raridade,
  onJogadorEscolhido
}: EscolherJogadorProps) {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jogadorSelecionado, setJogadorSelecionado] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchJogadores();
  }, [raridade]);

  const fetchJogadores = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/jogadores?raridade=${raridade}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar jogadores');
      }

      const data = await response.json();
      setJogadores(data);
    } catch (err) {
      console.error('Erro ao carregar jogadores:', err);
      setError('Erro ao carregar jogadores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEscolherJogador = async () => {
    if (!jogadorSelecionado) {
      alert('Selecione um jogador');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/escolher-jogador', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compraId,
          jogadorId: jogadorSelecionado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao escolher jogador');
      }

      onJogadorEscolhido();
      router.push('/meu-album');
    } catch (error) {
      console.error('Erro ao escolher jogador:', error);
      alert('Erro ao processar escolha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button
          onClick={fetchJogadores}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brasil-blue mb-4">
        Escolha seu jogador {raridade}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {jogadores.map((jogador) => (
          <div
            key={jogador.id}
            onClick={() => setJogadorSelecionado(jogador.id)}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
              jogadorSelecionado === jogador.id
                ? 'border-brasil-green bg-brasil-green/10'
                : 'border-gray-200 hover:border-brasil-green/50'
            }`}
          >
            <div className="relative w-full aspect-[3/4] mb-2">
              <Image
                src={formatarCaminhoImagem(jogador.time.nome, jogador.nome)[0]}
                alt={jogador.nome}
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.jpg';
                }}
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-brasil-blue">{jogador.nome}</h3>
              <p className="text-sm text-gray-600">{jogador.time.nome}</p>
              <p className="text-sm text-gray-600">{jogador.posicao}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={handleEscolherJogador}
          disabled={!jogadorSelecionado || loading}
          className={`px-8 py-3 rounded-lg text-white font-semibold transition-colors ${
            !jogadorSelecionado || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-brasil-green hover:bg-brasil-green/90'
          }`}
        >
          {loading ? 'Processando...' : 'Confirmar Escolha'}
        </button>
      </div>
    </div>
  );
} 