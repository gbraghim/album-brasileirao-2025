import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const TIMES_SERIE_A = {
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

type TimeId = keyof typeof TIMES_SERIE_A;

interface PageProps {
  params: {
    timeId: TimeId;
  };
}

export default async function TimePage({ params }: PageProps) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  const time = TIMES_SERIE_A[params.timeId];

  if (!time) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Time não encontrado</h1>
          <p className="text-gray-600 mb-4">O time que você está procurando não existe no álbum.</p>
          <Link href="/album" className="text-blue-600 hover:underline">
            Voltar para o álbum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/album" className="text-blue-600 hover:underline flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          Voltar para o álbum
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">{time.nome}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Informações do Clube</h2>
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
            <h2 className="text-xl font-semibold mb-4">Figurinhas do Time</h2>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-gray-500">Em breve: Lista de figurinhas do time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 