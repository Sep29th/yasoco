-- DropIndex
DROP INDEX "Session_createdAt_idx";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "expireAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Session_expireAt_idx" ON "Session"("expireAt");
