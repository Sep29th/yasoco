/*
  Warnings:

  - Added the required column `originalPrice` to the `Medicine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "originalPrice" DOUBLE PRECISION NOT NULL;
