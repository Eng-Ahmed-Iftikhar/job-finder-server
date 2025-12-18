/*
  Warnings:

  - The values [ENABLE,DISABLE] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."JobStatus_new" AS ENUM ('DRAFT', 'PUBLISHED');
ALTER TABLE "public"."jobs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."jobs" ALTER COLUMN "status" TYPE "public"."JobStatus_new" USING ("status"::text::"public"."JobStatus_new");
ALTER TYPE "public"."JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "public"."JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "public"."JobStatus_old";
ALTER TABLE "public"."jobs" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
ALTER TYPE "public"."WageRate" ADD VALUE 'WEEKLY';

-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "currency" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';
