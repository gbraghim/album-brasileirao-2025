import { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Meus Pacotes - Álbum Brasileirão 2025',
  description: 'Visualize seus pacotes de figurinhas disponíveis',
};

export default function PacotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
} 