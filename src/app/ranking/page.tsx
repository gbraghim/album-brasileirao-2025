'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Loading from '@/components/loading';
import Header from '@/components/Header';

interface RankingData {
  posicao: number;
  nome: string;
  valor: number;
  foto?: string;
}

interface Rankings {
  totalFigurinhas: RankingData[];
  figurinhasUnicas: RankingData[];
  figurinhasLendarias: RankingData[];
  figurinhasOuro: RankingData[];
  figurinhasPrata: RankingData[];
  trocasRealizadas: RankingData[];
  pacotesAbertos: RankingData[];
  pacotesComprados: RankingData[];
}

export default function Ranking() {
  const { data: session } = useSession();
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch('/api/ranking');
        if (!response.ok) throw new Error('Erro ao carregar rankings');
        const data = await response.json();
        setRankings(data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Header />
      <Loading />
    </div>
  );

  const renderMedalha = (posicao: number) => {
    switch (posicao) {
      case 1:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg flex items-center justify-center">
              <span className="text-white font-bold">1</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg flex items-center justify-center">
              <span className="text-white font-bold">2</span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg flex items-center justify-center">
              <span className="text-white font-bold">3</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brasil-blue/80 to-brasil-blue shadow-lg flex items-center justify-center">
              <span className="text-white font-bold">{posicao}</span>
            </div>
          </div>
        );
    }
  };

  const renderRankingCard = (
    titulo: string,
    dados: RankingData[],
    icone: string,
    cor: string,
    unidade: string = '',
    descricao: string
  ) => {
    const usuarioAtual = session?.user?.name;
    const posicaoUsuario = dados.findIndex(item => item.nome === usuarioAtual);
    const mostrarUsuario = posicaoUsuario > 9;

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-brasil-yellow/20">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-lg ${cor} flex items-center justify-center`}>
            <Image src={icone} alt={titulo} width={24} height={24} />
          </div>
          <h2 className="text-xl font-bold text-brasil-blue">{titulo}</h2>
        </div>

        <p className="text-sm text-gray-600 mb-6">{descricao}</p>

        <div className="space-y-4">
          {dados.slice(0, 10).map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                item.nome === usuarioAtual
                  ? 'bg-brasil-blue/10 border-2 border-brasil-blue'
                  : 'hover:bg-gray-50'
              }`}
            >
              {renderMedalha(index + 1)}
              <div className="flex-1 flex items-center gap-3">
                <span className="font-medium text-gray-700">{item.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-brasil-blue">{item.valor}</span>
                <span className="text-sm text-gray-500">{unidade}</span>
              </div>
            </div>
          ))}

          {mostrarUsuario && (
            <>
              <div className="h-px bg-gray-200 my-4" />
              <div className="flex items-center gap-4 p-3 rounded-lg bg-brasil-blue/10 border-2 border-brasil-blue">
                {renderMedalha(posicaoUsuario + 1)}
                <div className="flex-1 flex items-center gap-3">
                  <span className="font-medium text-gray-700">Você</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-brasil-blue">
                    {dados[posicaoUsuario].valor}
                  </span>
                  <span className="text-sm text-gray-500">{unidade}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!rankings) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-100 to-blue-500">
      <Header />
      <main className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-brasil-blue flex items-center gap-3">
            <Image src="/trophy.svg" alt="Troféu" width={32} height={32} />
            Ranking dos Colecionadores
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderRankingCard(
              'Total de Figurinhas',
              rankings.totalFigurinhas,
              '/figurinha.svg',
              'bg-green-500',
              'figurinhas',
              'Mostra o total de figurinhas que cada colecionador possui, incluindo as repetidas. Quanto mais pacotes você abrir, maior será seu total!'
            )}

            {renderRankingCard(
              'Figurinhas Únicas',
              rankings.figurinhasUnicas,
              '/album.svg',
              'bg-blue-500',
              'figurinhas',
              'Exibe quantas figurinhas diferentes cada colecionador possui. É o número de jogadores únicos no seu álbum, sem contar repetidas.'
            )}

            {renderRankingCard(
              'Figurinhas Lendárias',
              rankings.figurinhasLendarias,
              '/trophy.svg',
              'bg-purple-700',
              'figurinhas',
              'Ranking das figurinhas lendárias, as mais raras do álbum! Quem tem mais lendárias está no topo deste ranking.'
            )}

            {renderRankingCard(
              'Figurinhas Ouro',
              rankings.figurinhasOuro,
              '/ouro.svg',
              'bg-yellow-500',
              'figurinhas',
              'Ranking das figurinhas douradas, que são mais raras e valiosas. Quanto mais figurinhas douradas você tiver, maior será sua pontuação!'
            )}

            {renderRankingCard(
              'Figurinhas Prata',
              rankings.figurinhasPrata,
              '/prata.svg',
              'bg-gray-400',
              'figurinhas',
              'Mostra quantas figurinhas prateadas cada colecionador possui. São as figurinhas mais comuns, mas essenciais para completar o álbum.'
            )}

            {renderRankingCard(
              'Trocas Realizadas',
              rankings.trocasRealizadas,
              '/troca.svg',
              'bg-purple-500',
              'trocas',
              'Exibe o número de trocas que cada colecionador completou com sucesso. Trocar figurinhas é uma ótima maneira de conseguir as que faltam!'
            )}

            {renderRankingCard(
              'Pacotes Abertos',
              rankings.pacotesAbertos,
              '/pacote.svg',
              'bg-red-500',
              'pacotes',
              'Mostra quantos pacotes de figurinhas cada colecionador já abriu. Quanto mais pacotes, mais chances de conseguir figurinhas raras!'
            )}

            {renderRankingCard(
              'Pacotes Comprados',
              rankings.pacotesComprados,
              '/pacote.svg',
              'bg-orange-500',
              'comprados',
              'Ranking dos usuários que mais compraram pacotes! Só aparecem aqui quem realmente investiu para turbinar sua coleção.'
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 