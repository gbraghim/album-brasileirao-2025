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
      {/* Header com botão de logout */}
      <header className="bg-white/10 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Álbum Brasileirão 2025</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Meu Álbum do Brasileirão
          </h2>
          <p className="text-gray-600">
            Bem-vindo ao seu álbum digital! Em breve você poderá começar a colecionar suas figurinhas.
          </p>
        </div>
      </div>
    </div>
  );
} 