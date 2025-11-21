-- AlterTable
ALTER TABLE "Examination" ADD COLUMN     "cancelledBy" JSONB,
ADD COLUMN     "history" JSONB[] DEFAULT ARRAY[]::JSONB[];
