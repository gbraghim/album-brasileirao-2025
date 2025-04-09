'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

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
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

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

        {/* Login Form */}
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Acesse seu álbum</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-white mb-2">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-white mt-4">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-purple-300 hover:text-purple-200">
              Cadastre-se
            </Link>
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

        {/* Players Showcase */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Estrelas do Campeonato</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/players/endrick.jpg"
                  alt="Endrick"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-white">
                <h3 className="font-bold">Endrick</h3>
                <p className="text-sm text-gray-300">Palmeiras</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/players/veiga.jpg"
                  alt="Raphael Veiga"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-white">
                <h3 className="font-bold">Raphael Veiga</h3>
                <p className="text-sm text-gray-300">Palmeiras</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/players/gabigol.jpg"
                  alt="Gabigol"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-white">
                <h3 className="font-bold">Gabigol</h3>
                <p className="text-sm text-gray-300">Flamengo</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/players/arrascaeta.jpg"
                  alt="Arrascaeta"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-white">
                <h3 className="font-bold">Arrascaeta</h3>
                <p className="text-sm text-gray-300">Flamengo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-white mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Junte-se à Comunidade</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Ranking de Colecionadores</h3>
              <p>Compita com outros colecionadores e suba no ranking semanal.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">🏆</span>
                  Prêmios semanais
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">📊</span>
                  Estatísticas detalhadas
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">👥</span>
                  Comunidade ativa
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Eventos Especiais</h3>
              <p>Participe de eventos exclusivos e ganhe figurinhas raras.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">🎮</span>
                  Desafios diários
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">🎁</span>
                  Recompensas exclusivas
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">🏅</span>
                  Conquistas especiais
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Comece sua Coleção Hoje!</h2>
          <p className="text-xl text-gray-200 mb-8">
            Junte-se a milhares de colecionadores e comece sua jornada no álbum digital do Brasileirão 2025.
          </p>
          <Link
            href="/register"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </div>
    </div>
  );
} 