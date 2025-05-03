'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import EditarAvatar from '@/components/EditarAvatar';

type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password: string;
  numeroDeLogins: number;
  primeiroAcesso: boolean;
  createdAt: Date;
};

export default function PerfilPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || '/default-avatar.png');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaMsg, setSenhaMsg] = useState('');
  const [senhaLoading, setSenhaLoading] = useState(false);
  const senhaFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user');
          if (!response.ok) {
            throw new Error('Erro ao carregar dados do usuário');
          }
          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setUser(null);
        }
      }
    };

    fetchUser();
  }, [session]);

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.email) {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      }
    };

    fetchStats();
  }, [session]);

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSenhaLoading(true);
    setSenhaMsg('');
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha, confirmarSenha })
      });
      const data = await res.json();
      if (res.ok) {
        setSenhaMsg('Senha alterada com sucesso!');
        setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
        senhaFormRef.current?.reset();
      } else {
        setSenhaMsg(data.error || 'Erro ao trocar senha.');
      }
    } catch {
      setSenhaMsg('Erro ao trocar senha.');
    } finally {
      setSenhaLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Acesso Negado
          </h2>
          <p className="text-center text-gray-600">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <div className="w-full max-w-2xl px-4 md:px-6 py-6 md:py-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-brasil-blue text-center">Meu Perfil</h1>
        <div className="w-full flex flex-col items-center justify-center">
          {/* Informações do Usuário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-yellow/20 w-full max-w-md mx-auto mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-brasil-blue text-center">Informações Pessoais</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-semibold text-brasil-blue">{session?.user?.name}</h3>
                  <p className="text-sm md:text-base text-gray-600">{session?.user?.email}</p>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between p-3 md:p-4 bg-brasil-green/10 rounded-lg">
                  <span className="text-sm md:text-base text-brasil-blue font-medium">Data de Cadastro</span>
                  <span className="text-sm md:text-base text-brasil-green font-bold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Não disponível'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-brasil-yellow/10 rounded-lg">
                  <span className="text-sm md:text-base text-brasil-blue font-medium">Total de Figurinhas</span>
                  <span className="text-sm md:text-base text-brasil-yellow font-bold">{stats?.totalFigurinhas}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Troca de senha */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 border border-brasil-blue/20 w-full max-w-md mx-auto mt-4">
            <h2 className="text-lg font-bold mb-3 text-brasil-blue text-center">Trocar senha</h2>
            <form ref={senhaFormRef} onSubmit={handleTrocarSenha} className="space-y-4">
              <input type="password" required placeholder="Senha atual" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} className="w-full px-3 py-2 border rounded" />
              <input type="password" required placeholder="Nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className="w-full px-3 py-2 border rounded" />
              <input type="password" required placeholder="Confirmar nova senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} className="w-full px-3 py-2 border rounded" />
              <button type="submit" disabled={senhaLoading} className="w-full bg-blue-600 text-white rounded py-2 font-semibold disabled:opacity-50">
                {senhaLoading ? 'Salvando...' : 'Trocar senha'}
              </button>
            </form>
            {senhaMsg && <div className="mt-2 text-center text-sm text-gray-700">{senhaMsg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
} 