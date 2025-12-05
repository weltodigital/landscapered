-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "description" TEXT,
ADD COLUMN     "dimensionUnit" TEXT DEFAULT 'metres',
ADD COLUMN     "gardenLength" DOUBLE PRECISION,
ADD COLUMN     "gardenWidth" DOUBLE PRECISION,
ADD COLUMN     "preferredStyle" TEXT;
