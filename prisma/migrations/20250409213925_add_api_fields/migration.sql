/*
  Warnings:

  - You are about to drop the column `numero` on the `Figurinha` table. All the data in the column will be lost.
  - You are about to drop the column `repetida` on the `Figurinha` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Figurinha` table. All the data in the column will be lost.
  - Added the required column `jogadorId` to the `Figurinha` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Figurinha" DROP COLUMN "numero",
DROP COLUMN "repetida",
DROP COLUMN "time",
ADD COLUMN     "jogadorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Troca" (
    "id" TEXT NOT NULL,
    "figurinhaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Troca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Time" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "escudo" TEXT,
    "apiId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jogador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numero" INTEGER,
    "posicao" TEXT,
    "idade" INTEGER,
    "nacionalidade" TEXT,
    "foto" TEXT,
    "apiId" INTEGER NOT NULL,
    "timeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jogador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Time_apiId_key" ON "Time"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "Jogador_apiId_key" ON "Jogador"("apiId");

-- AddForeignKey
ALTER TABLE "Figurinha" ADD CONSTRAINT "Figurinha_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Troca" ADD CONSTRAINT "Troca_figurinhaId_fkey" FOREIGN KEY ("figurinhaId") REFERENCES "Figurinha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Troca" ADD CONSTRAINT "Troca_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jogador" ADD CONSTRAINT "Jogador_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
