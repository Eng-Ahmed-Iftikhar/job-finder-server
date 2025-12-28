/*
  Warnings:

  - You are about to drop the column `icon` on the `chat_groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."chat_groups" DROP COLUMN "icon",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "iconUrl" TEXT;
