import 'next-auth';
import NextAuth from "next-auth";

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username: string | null;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    username: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    username: string | null;
  }
} 