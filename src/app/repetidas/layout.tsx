import { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Minhas Repetidas - Álbum Brasileirão 2025',
  description: 'Gerencie suas figurinhas repetidas',
};

export default function RepetidasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
} 