'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setError('Ocorreu um erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Álbum Brasileirão 2025"
              width={120}
              height={120}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
            Álbum Digital do Brasileirão 2025
          </h1>
          <p className="text-xl text-blue-800 mb-8 max-w-2xl mx-auto">
            Colecione, troque e complete seu álbum digital com os jogadores do Campeonato Brasileiro.
            Uma experiência única para os fãs de futebol!
          </p>
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
              <div className="text-red-500 text-sm text-center">{error}</div>
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

        {/* Join Community Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8 text-blue-900">Junte-se à Comunidade</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Troca de Figurinhas</h3>
              <p className="text-blue-800">
                Conecte-se com outros colecionadores e troque suas figurinhas repetidas. 
                Um sistema seguro e fácil de usar para garantir trocas justas e divertidas.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Pacotes Diários</h3>
              <p className="text-blue-800">
                Todos os dias você recebe novos pacotes de figurinhas para completar seu álbum. 
                Quanto mais você participa, mais chances de conseguir figurinhas raras!
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Ranking de Figurinhas</h3>
              <p className="text-blue-800">
                Compita com outros colecionadores e suba no ranking semanal. 
                Mostre quem tem a melhor coleção do Brasileirão!
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
          >
            Começar Agora
          </Link>
        </div>
      </main>
    </div>
  );
} 