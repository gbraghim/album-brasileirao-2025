import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pacotes = await prisma.pacotePreco.findMany({ where: { ativo: true } });
  res.status(200).json(pacotes);
} 