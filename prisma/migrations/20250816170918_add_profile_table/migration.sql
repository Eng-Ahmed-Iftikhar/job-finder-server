/*
  Warnings:

  - The values [TWO_FACTOR_AUTH] on the enum `VerificationCodeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `profileImage` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."VerificationCodeType_new" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION');
ALTER TABLE "public"."verification_codes" ALTER COLUMN "type" TYPE "public"."VerificationCodeType_new" USING ("type"::text::"public"."VerificationCodeType_new");
ALTER TYPE "public"."VerificationCodeType" RENAME TO "VerificationCodeType_old";
ALTER TYPE "public"."VerificationCodeType_new" RENAME TO "VerificationCodeType";
DROP TYPE "public"."VerificationCodeType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "profileImage";

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "profilePic" TEXT,
    "cvUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
