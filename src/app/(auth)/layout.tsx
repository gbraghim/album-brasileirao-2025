import Header from '@/components/Header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <a href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Álbum Brasileirão 2025"
              width={120}
              height={120}
              className="rounded-lg"
            />
          </a>
        </div>
        {children}
      </main>
    </div>
  );
} 