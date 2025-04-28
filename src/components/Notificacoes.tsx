import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export function Notificacoes() {
  const { data: session } = useSession();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      fetchNotificacoes();
    }
  }, [session]);

  useEffect(() => {
    if (isOpen && notificacoes.some(n => !n.lida)) {
      marcarTodasComoLidas();
    }
  }, [isOpen]);

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

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notificacoes');
      if (response.ok) {
        const data = await response.json();
        if (!data || !Array.isArray(data)) {
          setNotificacoes([]);
          return;
        }
        setNotificacoes(data.map(notificacao => ({
          id: notificacao.id || '',
          mensagem: notificacao.mensagem || '',
          lida: notificacao.lida || false,
          tipo: notificacao.tipo || '',
          createdAt: notificacao.createdAt || '',
          troca: notificacao.troca ? {
            id: notificacao.troca.id || '',
            status: notificacao.troca.status || '',
            figurinhaOferta: {
              jogador: {
                nome: notificacao.troca.figurinhaOferta?.jogador?.nome || '',
                posicao: notificacao.troca.figurinhaOferta?.jogador?.posicao || '',
                numero: notificacao.troca.figurinhaOferta?.jogador?.numero || 0
              }
            },
            usuarioEnvia: {
              name: notificacao.troca.usuarioEnvia?.name || ''
            }
          } : undefined
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      setNotificacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}/lida`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotificacoes(notificacoes.map(n => 
          n.id === id ? { ...n, lida: true } : n
        ));
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch('/api/notificacoes/lidas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Notificações</h3>
          
          {loading ? (
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