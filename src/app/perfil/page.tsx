'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { User } from '@prisma/client';

export default function PerfilPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        const response = await fetch('/api/user');
        const data = await response.json();
        setUser(data);
      }
    };

    fetchUser();
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
       
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Acesso Negado
          </h2>
          <p className="text-center text-gray-600">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-brasil-blue mb-6">
          Meu Perfil
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <p className="mt-1 text-lg text-gray-900">
              {user?.name || 'Carregando...'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 text-lg text-gray-900">
              {user?.email || 'Carregando...'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data de Cadastro
            </label>
            <p className="mt-1 text-lg text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Carregando...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 