import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'eBrasileirão 2025',
  description: 'Colecione figurinhas do Campeonato Brasileiro',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
  }

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