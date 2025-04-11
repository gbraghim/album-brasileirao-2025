'use client';

import { useState, useEffect } from 'react';
import { Jogador } from '../../types/jogador';
import { Filtros } from '../../types/filtros';
import FiltrosRepetidas from '../../components/FiltrosRepetidas';
import FigurinhaCard from '../../components/FigurinhaCard';

export default function RepetidasPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    posicao: '',
    time: '',
    nacionalidade: ''
  });

  useEffect(() => {
    const fetchJogadores = async () => {
      try {
        const response = await fetch('/api/jogadores');
        const data = await response.json();
        // Filtrar apenas jogadores com quantidade > 1
        const jogadoresRepetidos = data.filter((j: Jogador) => j.quantidade > 1);
        setJogadores(jogadoresRepetidos);
      } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
      }
    };

    fetchJogadores();
  }, []);

  const handleAdicionarRepetida = async (jogador: Jogador) => {
    try {
      const response = await fetch('/api/repetidas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jogadorId: jogador.id }),
      });

      if (response.ok) {
        // Atualizar a lista de jogadores
        const updatedJogadores = jogadores.map(j => 
          j.id === jogador.id ? { ...j, quantidade: j.quantidade - 1 } : j
        ).filter(j => j.quantidade > 1);
        setJogadores(updatedJogadores);
      }
    } catch (error) {
      console.error('Erro ao adicionar figurinha repetida:', error);
    }
  };

  const jogadoresFiltrados = jogadores.filter(jogador => {
    if (filtros.posicao && jogador.posicao !== filtros.posicao) return false;
    if (filtros.time && jogador.time !== filtros.time) return false;
    if (filtros.nacionalidade && jogador.nacionalidade !== filtros.nacionalidade) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Minhas Figurinhas Repetidas</h1>
      
      <FiltrosRepetidas filtros={filtros} onFiltrosChange={setFiltros} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {jogadoresFiltrados.map(jogador => (
          <FigurinhaCard
            key={jogador.id}
            jogador={jogador}
            onAdicionarRepetida={handleAdicionarRepetida}
          />
        ))}
      </div>
    </div>
  );
} 