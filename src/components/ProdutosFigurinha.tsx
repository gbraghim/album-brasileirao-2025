import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ModalComprarFigurinha from './ModalComprarFigurinha';
import { toast } from 'react-hot-toast';

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

  const getImagemRaridade = (raridade: string) => {
    switch (raridade.toLowerCase()) {
      case 'lendário':
        return '/lendario.jpg';
      case 'ouro':
        return '/ouro.jpg';
      case 'prata':
        return '/prata.jpg';
      default:
        return '/placeholder.jpg';
    }
  };

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar compra');
      }

      if (data.url) {
        router.push(data.url);
      } else {
        throw new Error('URL de redirecionamento não encontrada');
      }
    } catch (error) {
      console.error('Erro ao processar compra:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao processar compra');
      }
    }
  };

  return (
    <div className="w-full flex flex-wrap justify-center gap-16">
      {produtos.map((produto) => {
        let borderColor = 'border-gray-200';
        if (produto.raridade.toLowerCase() === 'lendário') borderColor = 'border-purple-600';
        if (produto.raridade.toLowerCase() === 'ouro') borderColor = 'border-yellow-400';
        if (produto.raridade.toLowerCase() === 'prata') borderColor = 'border-gray-400';
        return (
          <div
            key={produto.id}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${borderColor} hover:shadow-2xl transition-all duration-300 flex flex-col items-center max-w-[210px] w-full min-w-[180px] p-0`}
            style={{ minHeight: 320 }}
          >
            <div className="relative w-full flex justify-center items-center bg-gradient-to-b from-white to-blue-50" style={{height: '160px', marginTop: '18px'}}>
              <Image
                src={getImagemRaridade(produto.raridade)}
                alt={produto.nome}
                fill
                className="object-contain bg-white"
                priority
                style={{objectPosition: 'center'}}
              />
            </div>
            <div className="flex flex-col flex-1 w-full px-3 py-2 items-center">
              <h3 className="text-base font-bold text-brasil-blue mb-0 text-center truncate w-full">
                {produto.nome}
              </h3>
              <span className="text-xl font-bold text-brasil-green mt-0 mb-1 block text-center">
                R$ {(produto.valor_centavos / 100).toFixed(2)}
              </span>
              <p className="text-gray-600 text-xs mb-1 text-center min-h-[18px]">{produto.descricao}</p>
              <button
                onClick={() => {
                  setRaridadeSelecionada(produto.raridade);
                  setModalAberto(true);
                }}
                disabled={compraEmProgresso === produto.id}
                className={`bg-brasil-green text-white px-4 py-1.5 rounded-lg hover:bg-brasil-green/90 transition-colors font-semibold mt-1 mb-1 w-[120px] mx-auto text-sm ${
                  compraEmProgresso === produto.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {compraEmProgresso === produto.id ? 'Processando...' : 'Comprar Agora'}
              </button>
            </div>
          </div>
        );
      })}
      <ModalComprarFigurinha
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        raridade={raridadeSelecionada}
        onConfirmar={handleComprar}
      />
    </div>
  );
} 