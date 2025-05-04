'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { dynamic } from './config/route';
import Loading from '@/components/loading';
import Header from '@/components/Header';
import Script from 'next/script';
import Head from 'next/head';

export { dynamic };

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Email ou senha inválidos');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError('Ocorreu um erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [session, router]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3473963599771699" crossOrigin="anonymous"></script>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
        <Suspense fallback={<Loading />}>
          <Header />
        </Suspense>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Script
              id="adsense-script"
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3473963599771699"
              crossOrigin="anonymous"
            />

            <div style={{ margin: '20px 0' }}>
              <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-3473963599771699"
                data-ad-slot="4567890123"
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
              <Script id="adsense-init" strategy="afterInteractive">
                {`(adsbygoogle = window.adsbygoogle || []).push({});`}
              </Script>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col items-center text-center mb-16 w-full">
              <div className="mb-8 flex justify-center">
                <Image
                  src="/logo.png"
                  alt="Álbum Brasileirão 2025"
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
                Álbum Brasileirão 2025
              </h1>
              <p className="text-lg text-blue-800 mb-4 max-w-6xl w-full mx-auto">
                Colecione, abra pacotes animados, troque e complete seu álbum digital com os jogadores do Campeonato Brasileiro! Figurinhas com raridades, estatísticas, ranking, trocas e muito mais. Uma experiência gamificada e moderna para fãs de futebol!
                <span className="block mt-2 text-base font-bold text-purple-700">⚡ Encontre jogadores LENDÁRIOS para complementar seu time e deixar sua coleção ainda mais especial!</span>
              </p>
            </div>

            {/* Login Form */}
            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-lg rounded-xl p-8 mb-16 shadow-lg border border-brasil-blue">
              <h2 className="text-2xl font-bold text-brasil-blue mb-6 text-center">Acesse seu álbum</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-brasil-blue mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-brasil-blue placeholder-brasil-blue/50 border border-brasil-blue focus:outline-none focus:ring-2 focus:ring-brasil-green"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-brasil-blue mb-2">Senha</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-brasil-blue placeholder-brasil-blue/50 border border-brasil-blue focus:outline-none focus:ring-2 focus:ring-brasil-green"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div className="text-right mb-2">
                  <Link href="/login" className="text-sm text-blue-600 hover:underline focus:outline-none">
                    Esqueceu sua senha?
                  </Link>
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
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

            <Script
              id="adsense-script"
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3473963599771699"
              crossOrigin="anonymous"
            />

            <div style={{ margin: '20px 0' }}>
              <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-3473963599771699"
                data-ad-slot="0987654321"
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
              <Script id="adsense-init" strategy="afterInteractive">
                {`(adsbygoogle = window.adsbygoogle || []).push({});`}
              </Script>
            </div>
          </div>
        </main>

        <main className="flex flex-col items-center justify-center w-full px-4">
          {/* Join Community Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-blue-900">Funcionalidades do Álbum</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-blue-900">📦✨ Pacotes Diários & Abertura Animada</h3>
                <p className="text-blue-800">
                  Receba pacotes de figurinhas todos os dias e viva a emoção de abrir cada pacote com animações exclusivas. Descubra jogadores de todos os clubes, com raridades Prata, Ouro e <span className="font-bold text-purple-700">Lendário</span>! Complete seu álbum com os craques mais raros do Brasileirão.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-blue-900">📊🏆 Coleção, Estatísticas e Ranking</h3>
                <p className="text-blue-800">
                  Veja seu progresso no álbum, acompanhe estatísticas detalhadas e dispute o ranking dos maiores colecionadores do Brasileirão. Complete seu álbum e conquiste seu lugar no topo!
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-blue-900">🔄🤝 Trocas e Comunidade</h3>
                <p className="text-blue-800">
                  Troque figurinhas repetidas com outros usuários de forma fácil e segura. Faça amigos, negocie e ajude outros colecionadores a completar o álbum. <b>Em breve:</b> pacotes premium!
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-2 mb-6">
            <Link
              href="/register"
              className="inline-block bg-brasil-blue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              Começar Agora
            </Link>
          </div>
        </main>
      </div>
    </>
  );
} 