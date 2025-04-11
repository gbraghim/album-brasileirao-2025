import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FootballBackground from '@/components/FootballBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Álbum Brasileirão 2025',
  description: 'Colecione figurinhas do Campeonato Brasileiro',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Providers session={session}>
          <FootballBackground />
          <main className="relative">{children}</main>
        </Providers>
      </body>
    </html>
  );
} 