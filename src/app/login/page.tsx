'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Ocorreu um erro ao fazer login');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-brasil-yellow/20">
      <h2 className="text-2xl font-bold text-brasil-blue mb-6 text-center">Acesse seu álbum</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-brasil-blue mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          className="w-full bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          Entrar
        </button>
      </form>
      <p className="text-center text-brasil-blue mt-4">
        Não tem uma conta?{' '}
        <Link href="/register" className="text-brasil-green hover:text-brasil-green/80 underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
} 