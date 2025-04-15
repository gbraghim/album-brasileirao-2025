import 'next-auth';
import { User as PrismaUser } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      username: string;
    }
  }

  interface User extends Omit<PrismaUser, 'password' | 'createdAt' | 'updatedAt' | 'numeroDeLogins' | 'primeiroAcesso'> {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
  }
} 