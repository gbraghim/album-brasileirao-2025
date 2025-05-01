import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthProvider } from './providers';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Álbum do Brasileirão 2025',
  description: 'Álbum de figurinhas do Brasileirão 2025',
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
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3473963599771699"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500`}>
        <AuthProvider>
          <main className="relative min-h-screen flex flex-col">
            {children}
            <Footer />
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
} 