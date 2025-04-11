'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const TIMES_SERIE_A = [
  { id: 'america-mg', nome: 'América-MG' },
  { id: 'athletico-pr', nome: 'Athletico-PR' },
  { id: 'atletico-mg', nome: 'Atlético-MG' },
  { id: 'bahia', nome: 'Bahia' },
  { id: 'botafogo', nome: 'Botafogo' },
  { id: 'corinthians', nome: 'Corinthians' },
  { id: 'cruzeiro', nome: 'Cruzeiro' },
  { id: 'cuiaba', nome: 'Cuiabá' },
  { id: 'flamengo', nome: 'Flamengo' },
  { id: 'fluminense', nome: 'Fluminense' },
  { id: 'fortaleza', nome: 'Fortaleza' },
  { id: 'gremio', nome: 'Grêmio' },
  { id: 'internacional', nome: 'Internacional' },
  { id: 'palmeiras', nome: 'Palmeiras' },
  { id: 'bragantino', nome: 'Red Bull Bragantino' },
  { id: 'santos', nome: 'Santos' },
  { id: 'sao-paulo', nome: 'São Paulo' },
  { id: 'vasco', nome: 'Vasco' },
  { id: 'vitoria', nome: 'Vitória' },
  { id: 'juventude', nome: 'Juventude' }
];

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
      <h1 className="text-3xl font-bold mb-6">Meu Álbum - Brasileirão 2025</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Times</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIMES_SERIE_A.map((time) => (
            <Link
              key={time.id}
              className="block p-4 border rounded-lg hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{time.nome}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 