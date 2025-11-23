/*
  Warnings:

  - You are about to drop the column `history` on the `Examination` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Examination" DROP COLUMN "history",
ADD COLUMN     "examinationFee" INTEGER;
