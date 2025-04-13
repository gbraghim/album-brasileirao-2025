import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';

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

  useEffect(() => {
    if (session) {
      fetchNotificacoes();
    }
  }, [session]);

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notificacoes');
      if (response.ok) {
        const data = await response.json();
        setNotificacoes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      await fetch(`/api/notificacoes/${id}`, {
        method: 'PATCH',
      });
      setNotificacoes(notificacoes.map(n => 
        n.id === id ? { ...n, lida: true } : n
      ));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const responderTroca = async (trocaId: string, aceitar: boolean) => {
    try {
      const response = await fetch(`/api/trocas/${trocaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: aceitar ? 'ACEITA' : 'RECUSADA',
        }),
      });

      if (response.ok) {
        await fetchNotificacoes();
      }
    } catch (error) {
      console.error('Erro ao responder troca:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch('/api/notificacoes/ler-todas', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar notificações como lidas');
      }

      // Atualizar o estado local
      setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
    }
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="relative">
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
                  }`}
                  onClick={() => marcarComoLida(notificacao.id)}
                >
                  <p className="text-sm text-gray-900">{notificacao.mensagem}</p>
                  {notificacao.tipo === 'PROPOSTA_TROCA' && notificacao.troca?.status === 'PENDENTE' && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          responderTroca(notificacao.troca!.id, true);
                        }}
                        className=" hover: text-white px-3 py-1 rounded text-sm"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          responderTroca(notificacao.troca!.id, false);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Recusar
                      </button>
                    </div>
                  )}
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