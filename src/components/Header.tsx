'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession, signIn } from 'next-auth/react';
import { Notificacoes } from './Notificacoes';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname() || '';
  const router = useRouter();
  
  return (
    <header className="bg-gradient-to-r from-green-500 to-yellow-300 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={session ? '/dashboard' : '/'} className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="eBrasileirão 2025"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <span className="text-xl font-bold text-gray-800">eBrasileirão 2025</span>
              </Link>
            </div>
            {session && pathname !== '/' && (
              <nav className="ml-6 flex space-x-8">
                <Link 
                  href="/dashboard" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/dashboard' 
                      ? 'border-white text-white' 
                      : 'border-transparent text-white/80 hover:text-white hover:border-white/50'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/pacotes" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/pacotes' 
                      ? 'border-white text-white' 
                      : 'border-transparent text-white/80 hover:text-white hover:border-white/50'
                  }`}
                >
                  Pacotes
                </Link>
                <Link 
                  href="/meu-album" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/meu-album' 
                      ? 'border-white text-white' 
                      : 'border-transparent text-white/80 hover:text-white hover:border-white/50'
                  }`}
                >
                  Meu Álbum
                </Link>
                <Link 
                  href="/repetidas" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/repetidas' 
                      ? 'border-white text-white' 
                      : 'border-transparent text-white/80 hover:text-white hover:border-white/50'
                  }`}
                >
                  Repetidas
                </Link>
                <Link 
                  href="/trocas" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/trocas' 
                      ? 'border-white text-white' 
                      : 'border-transparent text-white/80 hover:text-white hover:border-white/50'
                  }`}
                >
                  Trocas
                </Link>
                <Link 
                  href="/perfil" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/perfil' 
                      ? 'border-white text-white' 
                      : 'border-transparent text-white/80 hover:text-white hover:border-white/50'
                  }`}
                >
                  Perfil
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Notificacoes />
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 