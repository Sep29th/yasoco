/*
  Warnings:

  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "article_contenttext_trgm_idx";

-- DropIndex
DROP INDEX "article_search_vector_idx";

-- DropTable
DROP TABLE "Invoice";

-- CreateTable
CREATE TABLE "InvoiceTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" JSONB,

    CONSTRAINT "InvoiceTemplate_pkey" PRIMARY KEY ("id")
);
