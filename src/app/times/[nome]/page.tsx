'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CloudinaryImage } from '@/lib/cloudinary';

interface Jogador {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  idade: number;
  nacionalidade: string;
  foto: string;
}

interface Time {
  id: string;
  nome: string;
  escudo: string;
  jogadores: Jogador[];
}

export default function TimePage({ params }: { params: { nome: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [time, setTime] = useState<Time | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    const fetchTime = async () => {
      try {
        // Converter o nome da URL para um formato que possa ser comparado com o banco de dados
        const nomeFormatado = params.nome
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        const response = await fetch(`/api/times/nome/${nomeFormatado}`);
        const data = await response.json();
        setTime(data);
      } catch (error) {
        console.error('Erro ao carregar time:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTime();
  }, [status, router, params.nome]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Carregando jogadores...</h1>
        </div>
      </div>
    );
  }

  if (!time) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Time não encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 relative mr-4">
            <CloudinaryImage
              src={time.escudo}
              alt={time.nome}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold">{time.nome}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {time.jogadores.map((jogador) => (
            <div
              key={jogador.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex flex-col items-center">
                <div className="w-32 h-48 relative mb-4">
                  <CloudinaryImage
                    src={jogador.foto}
                    alt={jogador.nome}
                    width={128}
                    height={192}
                    className="object-cover rounded-lg"
                  />
                </div>
                <h2 className="text-xl font-bold text-center mb-2">{jogador.nome}</h2>
                <div className="text-center space-y-1">
                  <p className="text-gray-600">Número: {jogador.numero}</p>
                  <p className="text-gray-600">Posição: {jogador.posicao}</p>
                  <p className="text-gray-600">Idade: {jogador.idade} anos</p>
                  <p className="text-gray-600">Nacionalidade: {jogador.nacionalidade}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 