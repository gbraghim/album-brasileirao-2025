export interface CustomUser {
  id: string;
  email: string | null;
  name: string | null;
  password: string;
  numeroDeLogins: number;
  primeiroAcesso: boolean;
  createdAt: Date;
  updatedAt: Date;
} 