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
  
  return (
    <header className="bg-gradient-to-r from-brasil-blue via-brasil-green to-brasil-yellow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-white hover:text-brasil-yellow transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/meu-album"
              className="text-white hover:text-brasil-yellow transition-colors"
            >
              Meu Álbum
            </Link>
            <Link
              href="/pacotes"
              className="text-white hover:text-brasil-yellow transition-colors"
            >
              Pacotes
            </Link>
            <Link
              href="/repetidas"
              className="text-white hover:text-brasil-yellow transition-colors"
            >
              Repetidas
            </Link>
            <Link
              href="/trocas"
              className="text-white hover:text-brasil-yellow transition-colors"
            >
              Trocas
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Notificacoes />
                <Link
                  href="/perfil"
                  className="flex items-center space-x-2 text-white hover:text-brasil-yellow transition-colors"
                >
                  <span className="hidden md:inline">{session.user?.name}</span>
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
      </div>
    </header>
  );
} 