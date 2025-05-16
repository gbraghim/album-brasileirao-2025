import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 flex flex-col items-center justify-center">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="Álbum Brasileirão 2025"
          width={200}
          height={200}
          className="animate-pulse mb-8"
        />
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-brasil-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-brasil-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-brasil-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="mt-4 text-brasil-blue font-medium">Carregando...</p>
      </div>
    </div>
  );
} 