/*
  Warnings:

  - You are about to drop the column `socialEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `socialId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `socialName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `socialPicture` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."users_socialId_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "socialEmail",
DROP COLUMN "socialId",
DROP COLUMN "socialName",
DROP COLUMN "socialPicture",
ADD COLUMN     "profileImage" TEXT;
