'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer login');
      }

      // Redireciona para o dashboard após login bem-sucedido
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Álbum Digital Brasileirão 2025
          </h1>
          <p className="text-2xl text-gray-200 max-w-3xl mx-auto">
            Complete seu álbum com as estrelas do futebol brasileiro. Colecione, troque e compartilhe figurinhas dos seus jogadores favoritos!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-xl font-bold mb-2">20 Times da Série A</h3>
            <p>Todos os clubes do Brasileirão 2025 com seus elencos completos e atualizados.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-xl font-bold mb-2">Figurinhas Especiais</h3>
            <p>Encontre figurinhas raras dos craques e momentos históricos do campeonato.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">Sistema de Trocas</h3>
            <p>Troque suas figurinhas repetidas com outros colecionadores de todo o Brasil.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side - Features */}
          <div className="lg:w-1/2">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Por que colecionar?</h2>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Mais de 600 figurinhas para colecionar</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Figurinhas exclusivas dos artilheiros do campeonato</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Escudos e uniformes históricos dos clubes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Estatísticas atualizadas dos jogadores</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Sistema de conquistas e recompensas</span>
                </li>
              </ul>

              <div className="mt-8 p-4 bg-yellow-400/10 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-yellow-400">🏆 Times Participantes</h3>
                <p className="text-gray-200">
                  Flamengo, Palmeiras, Grêmio, São Paulo, Fluminense, Atlético-MG, Corinthians, Internacional, 
                  Athletico-PR, Vasco, Botafogo, Santos, Cruzeiro, Bahia, Fortaleza, Red Bull Bragantino, 
                  Cuiabá, Atlético-GO, Vitória, Juventude
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Registration Form */}
          <div className="lg:w-5/12">
            <div className="bg-white p-8 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Acesse seu Álbum
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Sua senha"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition duration-200 font-medium ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              <p className="mt-4 text-sm text-gray-600 text-center">
                Ainda não tem uma conta?{' '}
                <Link href="/register" className="text-purple-600 hover:text-purple-800 font-medium">
                  Cadastre-se
                </Link>
              </p>
            </div>

            <div className="mt-6 bg-green-500/10 backdrop-blur-lg rounded-xl p-4 text-white">
              <p className="text-sm">
                🎁 Novos usuários ganham um pacote com 5 figurinhas especiais ao se cadastrar!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 mt-16 border-t border-white/10">
        <div className="text-center text-gray-300 text-sm">
          <p>© 2025 Álbum Digital Brasileirão. Todos os direitos reservados.</p>
          <p className="mt-2">Todas as marcas e escudos são propriedades de seus respectivos donos.</p>
        </div>
      </div>
    </div>
  );
} 