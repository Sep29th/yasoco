/*
  Warnings:

  - You are about to drop the column `kidAge` on the `Examination` table. All the data in the column will be lost.
  - Added the required column `kidBirthDate` to the `Examination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Examination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Examination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Examination` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `kidGender` on the `Examination` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ExaminationStatus" AS ENUM ('BOOKED', 'WAITING', 'IN_PROGRESS', 'PENDING_PAYMENT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExaminationType" AS ENUM ('PRE_BOOKED', 'FOLLOW_UP', 'WALK_IN');

-- DropIndex
DROP INDEX "article_contenttext_trgm_idx";

-- DropIndex
DROP INDEX "article_search_vector_idx";

-- AlterTable
ALTER TABLE "Examination" DROP COLUMN "kidAge",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "diagnose" TEXT,
ADD COLUMN     "examinedBy" JSONB,
ADD COLUMN     "kidBirthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "kidWeight" INTEGER,
ADD COLUMN     "medicine" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paidBy" JSONB,
ADD COLUMN     "receivedBy" JSONB,
ADD COLUMN     "services" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "status" "ExaminationStatus" NOT NULL,
ADD COLUMN     "type" "ExaminationType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "kidGender",
ADD COLUMN     "kidGender" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
