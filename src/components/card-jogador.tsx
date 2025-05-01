import Image from 'next/image';
import { getS3PlayerUrl, getS3EscudoUrl } from '@/lib/utils';

interface CardJogadorProps {
  jogador: {
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
  };
  quantidade: number;
}

export function CardJogador({ jogador, quantidade }: CardJogadorProps) {
  const s3Url = getS3PlayerUrl(jogador.time.nome, jogador.nome);
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Image
            src={getS3EscudoUrl(jogador.time.escudo)}
            alt={jogador.time.nome}
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="text-sm text-gray-600">#{jogador.numero || 'N/A'}</span>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32">
            <Image
              src={s3Url}
              alt={jogador.nome}
              fill
              className="object-cover rounded-full"
            />
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-bold text-lg mb-1">{jogador.nome}</h3>
          <p className="text-sm text-gray-600 mb-1">{jogador.posicao || 'N/A'}</p>
          <p className="text-sm text-gray-600 mb-2">{jogador.nacionalidade || 'N/A'}</p>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block">
            x{quantidade}
          </div>
        </div>
      </div>
    </div>
  );
} 