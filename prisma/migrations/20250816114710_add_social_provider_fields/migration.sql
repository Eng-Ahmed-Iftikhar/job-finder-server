/*
  Warnings:

  - A unique constraint covering the columns `[socialId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."SocialProvider" AS ENUM ('GOOGLE', 'FACEBOOK', 'LINKEDIN', 'GITHUB');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "socialEmail" TEXT,
ADD COLUMN     "socialId" TEXT,
ADD COLUMN     "socialName" TEXT,
ADD COLUMN     "socialPicture" TEXT,
ADD COLUMN     "socialProvider" "public"."SocialProvider",
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_socialId_key" ON "public"."users"("socialId");
