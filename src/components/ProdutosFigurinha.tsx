import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ModalComprarFigurinha from './ModalComprarFigurinha';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  valor_centavos: number;
  raridade: string;
  imagem?: string;
}

interface ProdutosFigurinhaProps {
  produtos: Produto[];
  compraEmProgresso?: string | null;
}

export default function ProdutosFigurinha({ produtos, compraEmProgresso }: ProdutosFigurinhaProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [raridadeSelecionada, setRaridadeSelecionada] = useState('');

  const handleComprar = async (jogadorId: string) => {
    try {
      const response = await fetch('/api/comprar-figurinha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jogadorId,
          raridade: raridadeSelecionada
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar compra');
      }

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Erro ao processar compra:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {produtos.map((produto) => (
        <div
          key={produto.id}
          className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-brasil-blue/20 hover:border-brasil-blue/40 transition-all duration-300"
        >
          <div className="relative">
            {produto.imagem && (
              <Image
                src={produto.imagem}
                alt={produto.nome}
                width={400}
                height={400}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="absolute top-2 right-2 bg-brasil-blue text-white px-3 py-1 rounded-full text-sm font-bold">
              {produto.raridade}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-brasil-blue mb-2">
              {produto.nome}
            </h3>
            <p className="text-gray-600 mb-4">{produto.descricao}</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-brasil-green">
                R$ {(produto.valor_centavos / 100).toFixed(2)}
              </span>
              <button
                onClick={() => {
                  setRaridadeSelecionada(produto.raridade);
                  setModalAberto(true);
                }}
                disabled={compraEmProgresso === produto.id}
                className={`bg-brasil-green text-white px-6 py-2 rounded-lg hover:bg-brasil-green/90 transition-colors ${
                  compraEmProgresso === produto.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {compraEmProgresso === produto.id ? 'Processando...' : 'Comprar Agora'}
              </button>
            </div>
          </div>
        </div>
      ))}

      <ModalComprarFigurinha
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        raridade={raridadeSelecionada}
        onConfirmar={handleComprar}
      />
    </div>
  );
} 