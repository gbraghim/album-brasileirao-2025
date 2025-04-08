import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800">
      <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between">
        {/* Lado esquerdo - Texto e CTA */}
        <div className="lg:w-1/2 text-white space-y-8 mb-12 lg:mb-0">
          <h1 className="text-5xl font-bold leading-tight">
            Álbum Brasileirão 2025
          </h1>
          <p className="text-xl text-gray-300 max-w-lg">
            Monte seu álbum digital do Brasileirão! Colecione, troque figurinhas e complete seu álbum com outros torcedores apaixonados pelo futebol brasileiro.
          </p>
          <div className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Colecione figurinhas digitais dos seus jogadores favoritos</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Troque figurinhas com outros colecionadores</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Acompanhe seu progresso em tempo real</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lado direito - Formulário de registro */}
        <div className="lg:w-5/12">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Comece sua coleção agora
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Sua senha"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition duration-200 font-medium"
              >
                Criar minha conta
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 