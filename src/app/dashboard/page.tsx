'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-brasil-blue">Bem-vindo, {session?.user?.name}!</h1>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-brasil-yellow/20">
        <h2 className="text-xl font-semibold mb-4 text-brasil-blue">Seu Álbum</h2>
        <p className="text-brasil-blue/80 mb-4">
          Aqui você pode gerenciar seu álbum de figurinhas do Brasileirão 2025.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-brasil-blue/10 p-4 rounded-lg">
            <h3 className="font-medium text-brasil-blue mb-2">Suas Figurinhas</h3>
            <p className="text-brasil-blue/80">Visualize todas as suas figurinhas</p>
          </div>
          <div className="bg-brasil-green/10 p-4 rounded-lg">
            <h3 className="font-medium text-brasil-green mb-2">Pacotes Disponíveis</h3>
            <p className="text-brasil-green/80">Receba seu pacote diário de figurinhas</p>
          </div>
        </div>
      </div>
    </div>
  );
} 