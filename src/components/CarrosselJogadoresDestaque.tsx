import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Jogador } from '@/types/index';
import { formatarCaminhoImagem } from '@/lib/utils';

const getRaridadeStyle = (raridade: string) => {
  switch (raridade) {
    case 'Lendário':
      return 'border-purple-600 shadow-purple-600';
    case 'Ouro':
      return 'border-yellow-500 shadow-yellow-500';
    default:
      return 'border-gray-400 shadow-gray-400';
  }
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function CarrosselJogadoresDestaque() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJogadores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/jogadores');
        if (!res.ok) throw new Error('Falha ao carregar jogadores');
        
        const data: Jogador[] = await res.json();
        const lendarios = shuffleArray(data.filter(j => j.raridade === 'Lendário')).slice(0, 10);
        const ouros = shuffleArray(data.filter(j => j.raridade === 'Ouro')).slice(0, 20);
        const todos = shuffleArray([...lendarios, ...ouros]);
        
        // Criar 3 cópias para garantir um loop suave
        setJogadores([...todos, ...todos, ...todos]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar jogadores');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJogadores();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brasil-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden mb-8">
      <div
        className="flex gap-6 animate-marquee"
        style={{
          width: 'max-content',
          animation: 'marquee 120s linear infinite',
        }}
      >
        {jogadores.map((jogador, idx) => {
          const caminhos = formatarCaminhoImagem(jogador.time.nome, jogador.nome);
          return (
            <div
              key={`${jogador.id}-${idx}`}
              className={`relative w-32 h-44 md:w-36 md:h-52 lg:w-40 lg:h-56 rounded-lg border-4 ${getRaridadeStyle(jogador.raridade)} shadow-lg overflow-hidden bg-white/80 hover:scale-105 transition-transform duration-300`}
            >
              <Image
                src={caminhos[0]}
                alt={jogador.nome}
                fill
                className="object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (caminhos.length > 1 && img.src.includes(caminhos[0])) {
                    img.src = caminhos[1];
                  } else {
                    img.src = '/placeholder.jpg';
                  }
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-0.5 bg-white/90 backdrop-blur-sm flex flex-col items-center min-h-[36px]">
                <span className="text-sm font-bold text-black text-center leading-tight break-words">{jogador.nome}</span>
                <span className={`text-xs font-semibold mt-0.5 ${jogador.raridade === 'Lendário' ? 'text-purple-700' : 'text-yellow-600'}`}>{jogador.raridade}</span>
                {jogador.time?.escudo && (
                  <Image
                    src={jogador.time.escudo}
                    alt={`Escudo do ${jogador.time.nome}`}
                    width={15}
                    height={15}
                    className="mx-auto mb-0.5"
                  />
                )}
                <span className="text-xs text-center text-brasil-blue mt-0.5 font-semibold">{jogador.time?.nome}</span>
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
} 