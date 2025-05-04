import React from 'react';
import { useRouter } from 'next/navigation';

interface ModalCadastroSucessoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCadastroSucesso({ isOpen, onClose }: ModalCadastroSucessoProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full border-4 border-brasil-blue">
        <div className="flex flex-col items-center">
          <div className="bg-brasil-green rounded-full p-3 mb-4">
            <svg className="w-10 h-10 text-brasil-yellow" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brasil-blue mb-2">Cadastro realizado!</h2>
          <p className="text-brasil-blue mb-6 text-center">Seu cadastro foi concluído com sucesso.<br />Agora é só fazer login para começar a colecionar!</p>
          <button
            onClick={() => {
              onClose();
              router.push('/login');
            }}
            className="bg-brasil-blue hover:bg-brasil-green text-white font-bold px-8 py-3 rounded-lg transition duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
} 