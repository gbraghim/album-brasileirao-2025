'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import EscudosCarousel from '@/components/EscudosCarousel';

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
        redirect: true,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-brasil-blue mb-6">
            Álbum Digital Brasileirão 2025
          </h1>
          <p className="text-2xl text-brasil-blue/80 max-w-3xl mx-auto">
            Complete seu álbum com as estrelas do futebol brasileiro. Colecione, troque e compartilhe figurinhas dos seus jogadores favoritos!
          </p>
        </div>

        {/* Times Carousel */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-brasil-blue text-center mb-8">
            Times da Série A 2025
          </h2>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-brasil-yellow/20">
            <EscudosCarousel />
          </div>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-xl p-8 mb-16 shadow-lg border border-brasil-yellow/20">
          <h2 className="text-2xl font-bold text-brasil-blue mb-6 text-center">Acesse seu álbum</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-brasil-blue mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-brasil-blue placeholder-brasil-blue/50 border border-brasil-yellow focus:outline-none focus:ring-2 focus:ring-brasil-green"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-brasil-blue mb-2">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-brasil-blue placeholder-brasil-blue/50 border border-brasil-yellow focus:outline-none focus:ring-2 focus:ring-brasil-green"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-brasil-blue mt-4">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-brasil-green hover:text-brasil-green/80 underline">
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 text-brasil-blue shadow-lg border border-brasil-yellow/20">
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-xl font-bold mb-2">20 Times da Série A</h3>
            <p>Todos os clubes do Brasileirão 2025 com seus elencos completos e atualizados.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 text-brasil-blue shadow-lg border border-brasil-yellow/20">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-xl font-bold mb-2">Figurinhas Especiais</h3>
            <p>Encontre figurinhas raras dos craques e momentos históricos do campeonato.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 text-brasil-blue shadow-lg border border-brasil-yellow/20">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">Sistema de Trocas</h3>
            <p>Troque suas figurinhas repetidas com outros colecionadores de todo o Brasil.</p>
          </div>
        </div>

        {/* Engagement Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-8 text-brasil-blue shadow-lg border border-brasil-yellow/20 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Junte-se à Comunidade</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Ranking de Colecionadores</h3>
              <p>Compita com outros colecionadores e suba no ranking semanal.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <span className="text-brasil-green mr-2">🏆</span>
                  Prêmios semanais
                </li>
                <li className="flex items-center">
                  <span className="text-brasil-green mr-2">📊</span>
                  Estatísticas detalhadas
                </li>
                <li className="flex items-center">
                  <span className="text-brasil-green mr-2">👥</span>
                  Comunidade ativa
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Eventos Especiais</h3>
              <p>Participe de eventos exclusivos e ganhe figurinhas raras.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <span className="text-brasil-green mr-2">🎮</span>
                  Desafios diários
                </li>
                <li className="flex items-center">
                  <span className="text-brasil-green mr-2">🎁</span>
                  Recompensas exclusivas
                </li>
                <li className="flex items-center">
                  <span className="text-brasil-green mr-2">🏅</span>
                  Conquistas especiais
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brasil-blue mb-6">Comece sua Coleção Hoje!</h2>
          <p className="text-xl text-brasil-blue/80 mb-8">
            Junte-se a milhares de colecionadores e comece sua jornada no álbum digital do Brasileirão 2025.
          </p>
          <Link
            href="/register"
            className="inline-block bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow font-bold py-4 px-8 rounded-lg text-lg transition duration-200"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </div>
    </div>
  );
} 