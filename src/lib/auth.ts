import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('Iniciando processo de autenticação...');
          
          if (!credentials?.email || !credentials?.password) {
            console.error('Credenciais incompletas');
            throw new Error('Email e senha são obrigatórios');
          }

          console.log('Buscando usuário:', credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.error('Usuário não encontrado:', credentials.email);
            throw new Error('Usuário não encontrado');
          }

          console.log('Usuário encontrado:', user.email);
          console.log('Verificando senha...');
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('Resultado da verificação de senha:', isValid);

          if (!isValid) {
            console.error('Senha inválida para usuário:', user.email);
            throw new Error('Senha incorreta');
          }

          console.log('Autenticação bem-sucedida para:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name || 'Usuário'
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  }
}; 