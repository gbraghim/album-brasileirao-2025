import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthProvider } from './providers';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import BotaoCompartilharWhatsApp from '@/components/BotaoCompartilharWhatsApp';
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
        <Script id="clear-cache" strategy="beforeInteractive">
          {`
            if (window.caches && !localStorage.getItem('cache_limpo')) {
              caches.keys().then(function(names) {
                for (let name of names) {
                  caches.delete(name);
                }
                localStorage.setItem('cache_limpo', 'true');
              });
            }
          `}
        </Script>
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500`}>
        <BotaoCompartilharWhatsApp />
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