import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Álbum Brasileirão 2025</h3>
            <p className="text-sm text-gray-400">Colecione, troque e complete seu álbum!</p>
          </div>
          
          <div className="flex space-x-6">

            
            <a 
              href="https://www.instagram.com/albumebrasileirao/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-white font-extrabold rounded-2xl shadow-2xl hover:scale-110 transition-transform text-xl border-4 border-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-10 h-10">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm6 1.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>
              <span className="font-extrabold">@albumebrasileirao</span>
            </a>
            

          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Álbum Brasileirão 2025. Todos os direitos reservados.</p>
          <p className="mt-2">Criado por Gustavo B.</p>
        </div>
      </div>
    </footer>
  );
} 