/*
  Warnings:

  - Made the column `session` on table `ExaminationSession` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ExaminationSession" ALTER COLUMN "session" SET NOT NULL;
