import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center relative">
          <div className="mb-4 md:mb-0 z-10">
            <h3 className="text-lg font-semibold">Álbum Brasileirão 2025</h3>
            <p className="text-sm text-gray-400">Colecione, troque e complete seu álbum!</p>
          </div>



          <div className="flex space-x-6 z-10">

            
            <a 
              href="https://www.instagram.com/albumebrasileirao/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-white font-extrabold rounded-2xl shadow-2xl hover:scale-110 transition-transform text-xl border-4 border-white z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-10 h-10">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm6 1.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>

              <span className="font-extrabold">Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61575787875720"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-300 text-white font-extrabold rounded-2xl shadow-2xl hover:scale-110 transition-transform text-xl border-4 border-white z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-10 h-10">
                <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
              </svg>
              <span className="font-extrabold">Facebook</span>
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