'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-purple-700' : '';
  };

  return (
    <header className="bg-purple-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <nav className="flex space-x-4">
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')} hover:bg-purple-700 transition-colors`}
            >
              Home
            </Link>
            <Link 
              href="/album" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/album')} hover:bg-purple-700 transition-colors`}
            >
              Meu Álbum
            </Link>
            <Link 
              href="/repetidas" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/repetidas')} hover:bg-purple-700 transition-colors`}
            >
              Repetidas
            </Link>
            <Link 
              href="/trocas" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/trocas')} hover:bg-purple-700 transition-colors`}
            >
              Trocas
            </Link>
            <Link 
              href="/perfil" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/perfil')} hover:bg-purple-700 transition-colors`}
            >
              Perfil
            </Link>
          </nav>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
} 