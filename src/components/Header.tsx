'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession, signIn } from 'next-auth/react';
import { Notificacoes } from './Notificacoes';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname() || '';
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pacotes', label: 'Pacotes' },
    { href: '/meu-album', label: 'Meu Álbum' },
    { href: '/repetidas', label: 'Repetidas' },
    { href: '/trocas', label: 'Trocas' },
    { href: '/perfil', label: 'Perfil' }
  ];

  return (
    <header className="bg-gradient-to-r from-brasil-blue via-brasil-green to-brasil-yellow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Botão de voltar: só aparece se logado ou se não estiver na home */}
          { (session || pathname !== '/') && (
            <button
              onClick={() => router.back()}
              className="mr-4 flex items-center text-white hover:text-brasil-yellow transition-colors focus:outline-none"
              aria-label="Voltar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline ml-1">Voltar</span>
            </button>
          )}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Álbum Brasileirão 2025"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-white font-bold text-lg">Álbum 2025</span>
          </Link>

          {/* Menu e opções só aparecem se o usuário estiver logado */}
          {session && (
            <>
              {/* Menu Mobile */}
              <button
                className="md:hidden text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Menu Desktop */}
              <nav className="hidden md:flex items-center space-x-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-white hover:text-brasil-yellow transition-colors ${
                      pathname === item.href ? 'font-bold text-brasil-yellow' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </>
          )}

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Notificacoes />
                <Link
                  href="/perfil"
                  className="flex items-center space-x-2 text-white hover:text-brasil-yellow transition-colors"
                >
                  <span className="hidden md:inline">Olá, {session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Menu Mobile Expandido só se logado */}
        {session && isMenuOpen && (
          <nav className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-white hover:text-brasil-yellow transition-colors ${
                    pathname === item.href ? 'font-bold text-brasil-yellow' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 