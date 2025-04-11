import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

interface PageParams {
  nome: string;
}

export default async function TimePage({ params }: { params: PageParams }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  const time = await prisma.time.findFirst({
    where: {
      nome: {
        contains: params.nome.replace(/-/g, ' '),
        mode: 'insensitive'
      }
    },
    include: {
      jogadores: true
    }
  });

  if (!time) {
    redirect('/times');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{time.nome}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Informações do Time</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={time.escudo || '/placeholder-escudo.png'}
                alt={`Escudo do ${time.nome}`}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-600">
              Total de jogadores: {time.jogadores.length}
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Jogadores</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <ul className="space-y-2">
              {time.jogadores.map((jogador) => (
                <li key={jogador.id} className="flex items-center">
                  <span className="text-gray-800">{jogador.nome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 