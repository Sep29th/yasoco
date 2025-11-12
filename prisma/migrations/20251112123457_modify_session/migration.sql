-- AlterTable
ALTER TABLE "ExaminationSession" ALTER COLUMN "session" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "token";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
