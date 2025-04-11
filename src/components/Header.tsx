'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname() || '';
  
  return (
    <div className="bg-brasil-green text-white shadow-lg relative z-10">
      <div className="container mx-auto px-4 relative">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                pathname === '/dashboard' ? 'bg-brasil-blue text-brasil-yellow' : 'hover:bg-brasil-blue/20'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/pacotes" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                pathname === '/pacotes' ? 'bg-brasil-blue text-brasil-yellow' : 'hover:bg-brasil-blue/20'
              }`}
            >
              Pacotes
            </Link>
            <Link 
              href="/repetidas" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                pathname === '/repetidas' ? 'bg-brasil-blue text-brasil-yellow' : 'hover:bg-brasil-blue/20'
              }`}
            >
              Repetidas
            </Link>
            <Link 
              href="/trocas" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                pathname === '/trocas' ? 'bg-brasil-blue text-brasil-yellow' : 'hover:bg-brasil-blue/20'
              }`}
            >
              Trocas
            </Link>
            <Link 
              href="/meu-album" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                pathname === '/meu-album' ? 'bg-brasil-blue text-brasil-yellow' : 'hover:bg-brasil-blue/20'
              }`}
            >
              Meu Álbum
            </Link>
            <Link 
              href="/perfil" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                pathname === '/perfil' ? 'bg-brasil-blue text-brasil-yellow' : 'hover:bg-brasil-blue/20'
              }`}
            >
              Perfil
            </Link>
          </div>
          
          <div className="flex items-center relative">
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow px-4 py-2 rounded-md text-sm font-medium transition-colors relative"
              >
                Sair
              </button>
            )}
            {!session && (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-white hover:text-brasil-yellow transition-colors relative"
                >
                  Entrar
                </Link>
                <Link 
                  href="/register" 
                  className="bg-brasil-blue hover:bg-brasil-blue/80 text-brasil-yellow px-4 py-2 rounded-md text-sm font-medium transition-colors relative"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 