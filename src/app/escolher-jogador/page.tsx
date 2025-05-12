'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import EscolherJogador from '@/components/EscolherJogador';

export default function EscolherJogadorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [compra, setCompra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const compraId = searchParams?.get('compraId');
      if (!compraId) {
        router.push('/meu-album');
        return;
      }
      fetchCompra(compraId);
    }
  }, [status, router, searchParams]);

  const fetchCompra = async (compraId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/compras/${compraId}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar compra');
      }

      const data = await response.json();
      setCompra(data);
    } catch (err) {
      console.error('Erro ao carregar compra:', err);
      setError('Erro ao carregar compra. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleJogadorEscolhido = () => {
    router.push('/meu-album');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/meu-album')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Voltar para o Álbum
          </button>
        </div>
      </div>
    );
  }

  if (!compra) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-brasil-yellow/20">
          <EscolherJogador
            compraId={compra.id}
            raridade={compra.produto.raridade}
            onJogadorEscolhido={handleJogadorEscolhido}
          />
        </div>
      </div>
    </div>
  );
} 