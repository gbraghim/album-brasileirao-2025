import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Álbum Brasileirão 2025",
  description: "Monte seu álbum digital do Brasileirão! Colecione, troque figurinhas e complete seu álbum.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers session={session}>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
} 