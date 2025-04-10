import ProtectedNav from '@/components/ProtectedNav';
import Footer from '@/components/Footer';

export default function TimesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <ProtectedNav />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 