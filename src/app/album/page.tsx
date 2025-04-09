'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AlbumPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Meu Álbum</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumo do Álbum</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Figurinhas Coladas</p>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Repetidas</p>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Faltantes</p>
            <p className="text-2xl font-bold text-purple-600">0</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Álbum em Construção</h2>
        <p className="text-gray-600 mb-4">
          Esta funcionalidade está em desenvolvimento. Em breve você poderá gerenciar seu álbum aqui!
        </p>
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p className="text-gray-500">Em breve disponível</p>
        </div>
      </div>
    </div>
  );
} 