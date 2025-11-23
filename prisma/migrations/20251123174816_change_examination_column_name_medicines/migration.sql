/*
  Warnings:

  - You are about to drop the column `medicine` on the `Examination` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Examination" DROP COLUMN "medicine",
ADD COLUMN     "medicines" JSONB[] DEFAULT ARRAY[]::JSONB[];
