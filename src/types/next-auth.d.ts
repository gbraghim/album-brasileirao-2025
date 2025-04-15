import 'next-auth';
import { User as PrismaUser } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      username: string;
      image?: string | null;
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
  }
} 