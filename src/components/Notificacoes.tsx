import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

interface Notificacao {
  id: string;
  mensagem: string;
  lida: boolean;
  tipo: string;
  createdAt: string;
  troca?: {
    id: string;
    status: string;
    figurinhaOferta: {
      jogador: {
        nome: string;
        posicao: string;
        numero: number;
      };
    };
    usuarioEnvia: {
      name: string;
    };
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Notificacoes() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // SWR para notificações
  const { data: notificacoes = [], isLoading, mutate } = useSWR<Notificacao[]>(
    session ? '/api/notificacoes' : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Marcar como lida
  const marcarComoLida = async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}/lida`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) mutate();
    } catch (error) {
      // erro silencioso
    }
  };

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch('/api/notificacoes/lidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) mutate();
    } catch (error) {
      // erro silencioso
    }
  };

  // Marcar todas como lidas ao abrir dropdown
  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notificacoes.some(n => !n.lida)) {
      marcarTodasComoLidas();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-green-700"
      >
        <Bell className="w-6 h-6 text-white" />
        {notificacoesNaoLidas > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificacoesNaoLidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-xs sm:max-w-sm md:max-w-md lg:w-96 bg-white rounded-lg shadow-lg p-4 z-50 min-w-[220px] sm:min-w-[320px] w-full sm:w-80 md:w-96" style={{maxWidth: '95vw'}}>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Notificações</h3>
          {isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : notificacoes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Você ainda não tem notificações</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notificacoes.map(notificacao => (
                <div
                  key={notificacao.id}
                  className={`p-4 rounded-lg ${
                    notificacao.lida ? 'bg-gray-50' : 'bg-blue-50'
                  } cursor-pointer`}
                  onClick={() => {
                    marcarComoLida(notificacao.id);
                    router.push('/trocas');
                  }}
                >
                  <p className="text-sm text-gray-900">{notificacao.mensagem}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notificacao.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 