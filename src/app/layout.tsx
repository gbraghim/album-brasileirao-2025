import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';
import Footer from '@/components/Footer';

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
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500`}>
        <Providers session={session}>
          <main className="relative">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
} 