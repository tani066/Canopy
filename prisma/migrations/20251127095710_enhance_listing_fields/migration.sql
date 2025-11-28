-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "brandModel" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "negotiable" BOOLEAN,
ADD COLUMN     "originalPrice" DOUBLE PRECISION;
