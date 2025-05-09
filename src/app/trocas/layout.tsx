import { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Trocas - Álbum Brasileirão 2025',
  description: 'Gerencie suas trocas de figurinhas',
};

export default function TrocasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
} 