import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-6">
            Álbum Brasileirão 2025
          </h1>
          <p className="text-xl mb-8">
            Colecione as figurinhas dos seus jogadores favoritos
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
} 