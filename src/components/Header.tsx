'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  if (!session) return null;

  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}>
              Home
            </Link>
            <Link href="/album" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/album')}`}>
              Meu Álbum
            </Link>
            <Link href="/repetidas" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/repetidas')}`}>
              Repetidas
            </Link>
            <Link href="/trocas" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/trocas')}`}>
              Trocas
            </Link>
            <Link href="/perfil" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/perfil')}`}>
              Perfil
            </Link>
          </div>
          
          <div className="flex items-center">
            <span className="mr-4 text-sm">Olá, {session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 