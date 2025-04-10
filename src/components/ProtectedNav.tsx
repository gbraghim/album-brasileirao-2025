'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function ProtectedNav() {
  const pathname = usePathname() || '';
  
  return (
    <div className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/dashboard' ? 'bg-blue-700' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              href="/times" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname.startsWith('/times') ? 'bg-blue-700' : ''
              }`}
            >
              Times
            </Link>
            <Link 
              href="/repetidas" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/repetidas' ? 'bg-blue-700' : ''
              }`}
            >
              Repetidas
            </Link>
            <Link 
              href="/trocas" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/trocas' ? 'bg-blue-700' : ''
              }`}
            >
              Trocas
            </Link>
            <Link 
              href="/perfil" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/perfil' ? 'bg-blue-700' : ''
              }`}
            >
              Perfil
            </Link>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 