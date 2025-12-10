/*
  Warnings:

  - You are about to drop the column `medicineOriginalPrice` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `medicineSellingPrice` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Medicine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "medicineOriginalPrice",
DROP COLUMN "medicineSellingPrice";

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "originalPrice",
DROP COLUMN "price";
