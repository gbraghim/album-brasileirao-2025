'use client';

import { useState } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const TIMES = {
  'america-mg': { nome: 'América-MG', estado: 'Minas Gerais', fundacao: '1912' },
  'athletico-pr': { nome: 'Athletico-PR', estado: 'Paraná', fundacao: '1924' },
  'atletico-mg': { nome: 'Atlético-MG', estado: 'Minas Gerais', fundacao: '1908' },
  'bahia': { nome: 'Bahia', estado: 'Bahia', fundacao: '1931' },
  'botafogo': { nome: 'Botafogo', estado: 'Rio de Janeiro', fundacao: '1904' },
  'corinthians': { nome: 'Corinthians', estado: 'São Paulo', fundacao: '1910' },
  'cruzeiro': { nome: 'Cruzeiro', estado: 'Minas Gerais', fundacao: '1921' },
  'cuiaba': { nome: 'Cuiabá', estado: 'Mato Grosso', fundacao: '2001' },
  'flamengo': { nome: 'Flamengo', estado: 'Rio de Janeiro', fundacao: '1895' },
  'fluminense': { nome: 'Fluminense', estado: 'Rio de Janeiro', fundacao: '1902' },
  'fortaleza': { nome: 'Fortaleza', estado: 'Ceará', fundacao: '1918' },
  'gremio': { nome: 'Grêmio', estado: 'Rio Grande do Sul', fundacao: '1903' },
  'internacional': { nome: 'Internacional', estado: 'Rio Grande do Sul', fundacao: '1909' },
  'palmeiras': { nome: 'Palmeiras', estado: 'São Paulo', fundacao: '1914' },
  'bragantino': { nome: 'Red Bull Bragantino', estado: 'São Paulo', fundacao: '1928' },
  'santos': { nome: 'Santos', estado: 'São Paulo', fundacao: '1912' },
  'sao-paulo': { nome: 'São Paulo', estado: 'São Paulo', fundacao: '1930' },
  'vasco': { nome: 'Vasco', estado: 'Rio de Janeiro', fundacao: '1898' },
  'vitoria': { nome: 'Vitória', estado: 'Bahia', fundacao: '1899' },
  'juventude': { nome: 'Juventude', estado: 'Rio Grande do Sul', fundacao: '1913' }
} as const;

type Time = typeof TIMES[keyof typeof TIMES];

function Modal({ time, onClose }: { time: Time; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{time.nome}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Informações do Clube</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Estado:</span> {time.estado}
              </div>
              <div>
                <span className="font-medium">Ano de Fundação:</span> {time.fundacao}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Figurinhas do Time</h3>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-gray-500">Em breve: Lista de figurinhas do time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimesPage() {
  const [selectedTime, setSelectedTime] = useState<Time | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Times do Brasileirão 2025</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Object.entries(TIMES).map(([id, time]) => (
          <div
            key={id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedTime(time)}
          >
            <h2 className="text-xl font-semibold mb-2">{time.nome}</h2>
            <p className="text-gray-600">{time.estado}</p>
          </div>
        ))}
      </div>

      {selectedTime && (
        <Modal
          time={selectedTime}
          onClose={() => setSelectedTime(null)}
        />
      )}
    </div>
  );
} 