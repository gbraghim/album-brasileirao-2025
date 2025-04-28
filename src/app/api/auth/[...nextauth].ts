import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verificarPacotesIniciais } from '@/lib/pacotes';
import { compare } from 'bcryptjs';
import type { AuthOptions } from 'next-auth';

interface UserStatus {
  primeiroAcesso: boolean;
}

interface UserWithPassword {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  numeroDeLogins: number;
  primeiroAcesso: boolean;
  password: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('Credenciais não fornecidas');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            numeroDeLogins: true,
            primeiroAcesso: true,
            password: true,
          },
        }) as UserWithPassword | null;

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Senha inválida');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 