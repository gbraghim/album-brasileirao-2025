import RegisterForm from '@/components/RegisterForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800">
      <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between">
        {/* Lado esquerdo - Texto e CTA */}
        <div className="lg:w-1/2 text-white space-y-8 mb-12 lg:mb-0">
          <h1 className="text-5xl font-bold leading-tight">
            Álbum Brasileirão 2025
          </h1>
          <p className="text-xl text-gray-300 max-w-lg">
            Monte seu álbum digital do Brasileirão! Colecione, troque figurinhas e complete seu álbum com outros torcedores apaixonados pelo futebol brasileiro.
          </p>
          <div className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Colecione figurinhas digitais dos seus jogadores favoritos</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Troque figurinhas com outros colecionadores</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Acompanhe seu progresso em tempo real</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lado direito - Formulário de registro */}
        <div className="lg:w-5/12">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
} 