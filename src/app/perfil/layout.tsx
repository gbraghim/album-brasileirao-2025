import { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Meu Perfil - Álbum Brasileirão 2025',
  description: 'Visualize e gerencie suas informações de perfil',
};

export default function PerfilLayout({
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