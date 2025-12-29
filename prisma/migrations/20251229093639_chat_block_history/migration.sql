/*
  Warnings:

  - You are about to drop the column `blocked_by` on the `chat_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `blocked_to` on the `chat_blocks` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `chat_blocks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."chat_blocks" DROP CONSTRAINT "chat_blocks_blocked_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_blocks" DROP CONSTRAINT "chat_blocks_blocked_to_fkey";

-- DropIndex
DROP INDEX "public"."chat_blocks_blocked_by_blocked_to_chat_id_key";

-- AlterTable
ALTER TABLE "public"."chat_blocks" DROP COLUMN "blocked_by",
DROP COLUMN "blocked_to",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."chat_blocks" ADD CONSTRAINT "chat_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
