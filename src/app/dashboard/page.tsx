'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // Por enquanto, apenas redireciona para a página inicial
    // Posteriormente implementaremos a lógica completa de logout
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800">
      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-gray-600">
            Bem-vindo ao seu álbum digital! Em breve você poderá começar a colecionar suas figurinhas.
          </p>
        </div>
      </div>
    </div>
  );
} 