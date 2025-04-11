import { Metadata } from 'next';
import TimesLayoutClient from './TimesLayoutClient';

export const metadata: Metadata = {
  title: 'Times - Álbum Brasileirão 2025',
  description: 'Visualize todos os times do Brasileirão 2025',
};

export default function TimesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TimesLayoutClient>{children}</TimesLayoutClient>;
} 