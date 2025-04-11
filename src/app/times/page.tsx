'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CloudinaryImage } from '@/lib/cloudinary';

interface Time {
  id: string;
  nome: string;
  escudo: string;
  _count: {
    jogadores: number;
  };
}

export default function TimesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [times, setTimes] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    const fetchTimes = async () => {
      try {
        const response = await fetch('/api/times');
        const data = await response.json();
        setTimes(data);
      } catch (error) {
        console.error('Erro ao carregar times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimes();
  }, [status, router]);

  const formatarNomeParaUrl = (nome: string) => {
    return nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <h1 className="text-3xl font-bold mb-8 text-brasil-blue">Carregando times...</h1>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-8 text-brasil-blue">Times do Brasileirão 2025</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {times.map((time) => (
                <div
                  key={time.id}
                  onClick={() => router.push(`/times/${formatarNomeParaUrl(time.nome)}`)}
                  className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-brasil-yellow/20"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 relative mb-4">
                      <CloudinaryImage
                        src={time.escudo}
                        alt={time.nome}
                        width={96}
                        height={96}
                        className="object-contain"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-center mb-2 text-brasil-blue">{time.nome}</h2>
                    <p className="text-brasil-blue/80">{time._count.jogadores} jogadores</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 