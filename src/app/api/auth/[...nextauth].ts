import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verificarPacotesIniciais } from '@/lib/pacotes';

interface UserStatus {
  primeiroAcesso: boolean;
}

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials) {
            throw new Error('Credenciais não fornecidas');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error('Usuário não encontrado');
          }

          try {
            // Incrementar numeroDeLogins usando SQL raw
            await prisma.$executeRaw`UPDATE "User" SET "numeroDeLogins" = "numeroDeLogins" + 1 WHERE id = ${user.id}`;

            // Verificar e atualizar primeiroAcesso usando SQL raw
            const userStatus = await prisma.$queryRaw<UserStatus[]>`
              SELECT "primeiroAcesso" FROM "User" WHERE id = ${user.id}
            `;

            if (userStatus[0]?.primeiroAcesso) {
              await verificarPacotesIniciais(user.id);
              await prisma.$executeRaw`
                UPDATE "User" SET "primeiroAcesso" = false WHERE id = ${user.id}
              `;
            }
          } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        },
      }),
    ],
    callbacks: {
      async session({ session, token }) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
      async jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
        }
        return token;
      },
    },
  }); 