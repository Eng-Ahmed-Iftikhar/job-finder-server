-- CreateEnum
CREATE TYPE "public"."WorkMode" AS ENUM ('ONSITE', 'REMOTE');

-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "workMode" "public"."WorkMode";
