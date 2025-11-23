/*
  Warnings:

  - The `content` column on the `Article` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `symptoms` column on the `Examination` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `diagnose` column on the `Examination` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `note` column on the `Examination` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "content",
ADD COLUMN     "content" JSONB;

-- AlterTable
ALTER TABLE "Examination" DROP COLUMN "symptoms",
ADD COLUMN     "symptoms" JSONB,
DROP COLUMN "diagnose",
ADD COLUMN     "diagnose" JSONB,
DROP COLUMN "note",
ADD COLUMN     "note" JSONB;
