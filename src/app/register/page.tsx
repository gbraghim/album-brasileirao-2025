'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar conta');
      }

      router.push('/login?registered=true');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar conta');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-brasil-yellow/20">
      <h2 className="text-2xl font-bold text-brasil-blue mb-6 text-center">Crie sua conta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-brasil-blue mb-2">Nome</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/90 text-brasil-blue placeholder-brasil-blue/50 border border-brasil-yellow focus:outline-none focus:ring-2 focus:ring-brasil-green"
            placeholder="Seu nome"
          />
        </div>
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
          Criar Conta
        </button>
      </form>
      <p className="text-center text-brasil-blue mt-4">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-brasil-green hover:text-brasil-green/80 underline">
          Faça login
        </Link>
      </p>
    </div>
  );
} 