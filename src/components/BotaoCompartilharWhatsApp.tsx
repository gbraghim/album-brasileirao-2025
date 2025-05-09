import React from 'react';

export default function BotaoCompartilharWhatsApp() {
  const mensagem = encodeURIComponent(
    "Veja que incrível o álbum digital do Campeonato Brasileiro 2025!! Vamos colecionar!? https://ebrasileirao.fun/"
  );
  const url = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const link = `https://wa.me/?text=${mensagem}%20${url}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg transition-all"
      title="Compartilhar no WhatsApp"
    >
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.2 5.077 4.366.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 012.1 12.005c0-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.987c-.003 5.45-4.437 9.884-9.888 9.884zm8.413-18.297A11.815 11.815 0 0012.01.1C5.495.1.1 5.495.1 12.006c0 2.122.555 4.191 1.607 6.021L.057 23.925a1 1 0 001.225 1.225l5.899-1.65a11.888 11.888 0 005.829 1.482h.005c6.514 0 11.909-5.395 11.909-11.91 0-3.181-1.241-6.174-3.495-8.528z"/>
      </svg>
      <span className="hidden sm:inline">Compartilhar</span>
    </a>
  );
} 