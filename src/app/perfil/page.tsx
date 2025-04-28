'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { EditarAvatar } from '@/components/EditarAvatar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MinhasFigurinhas } from '@/components/MinhasFigurinhas';

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

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return <div>Não autorizado</div>;
  }

  const usuario = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!usuario) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Nome:</p>
            <p className="font-semibold">{usuario.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-semibold">{usuario.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 