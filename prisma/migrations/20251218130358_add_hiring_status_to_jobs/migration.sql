-- CreateEnum
CREATE TYPE "public"."HiringStatus" AS ENUM ('URGENT', 'NORMAL');

-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "hiringStatus" "public"."HiringStatus" NOT NULL DEFAULT 'NORMAL';
