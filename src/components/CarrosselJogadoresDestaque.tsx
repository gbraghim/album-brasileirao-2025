import Image from 'next/image';
import { useState, useEffect } from 'react';

const jogadoresDestaque = [
  {
    nome: 'Pelé',
    raridade: 'Lendário',
    imagem: '/jogadores/pele.jpg',
  },
  {
    nome: 'Zico',
    raridade: 'Lendário',
    imagem: '/jogadores/zico.jpg',
  },
  {
    nome: 'Romário',
    raridade: 'Ouro',
    imagem: '/jogadores/romario.jpg',
  },
  {
    nome: 'Ronaldo',
    raridade: 'Ouro',
    imagem: '/jogadores/ronaldo.jpg',
  },
];

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

export default function CarrosselJogadoresDestaque() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % jogadoresDestaque.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const jogador = jogadoresDestaque[index];

  return (
    <div className="flex flex-col items-center mb-8">
      <div className={`relative w-40 h-56 rounded-lg border-4 ${getRaridadeStyle(jogador.raridade)} shadow-lg overflow-hidden transition-all duration-500 bg-white/80`}>
        <Image
          src={jogador.imagem}
          alt={jogador.nome}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm flex flex-col items-center">
          <span className="text-base font-bold text-black text-center leading-tight break-words">{jogador.nome}</span>
          <span className={`text-xs font-semibold mt-1 ${jogador.raridade === 'Lendário' ? 'text-purple-700' : 'text-yellow-600'}`}>{jogador.raridade}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {jogadoresDestaque.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-brasil-blue' : 'bg-gray-300'}`}
            onClick={() => setIndex(i)}
            aria-label={`Ver jogador ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 