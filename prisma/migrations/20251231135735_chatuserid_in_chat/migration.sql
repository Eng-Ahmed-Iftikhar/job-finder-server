/*
  Warnings:

  - You are about to drop the column `user_id` on the `chat_blocks` table. All the data in the column will be lost.
  - Added the required column `chat_user_id` to the `chat_blocks` table without a default value. This is not possible if the table is not empty.
  - Made the column `chat_id` on table `chat_blocks` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."chat_blocks" DROP CONSTRAINT "chat_blocks_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_blocks" DROP CONSTRAINT "chat_blocks_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."chat_blocks" DROP COLUMN "user_id",
ADD COLUMN     "chat_user_id" TEXT NOT NULL,
ALTER COLUMN "chat_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."chat_blocks" ADD CONSTRAINT "chat_blocks_chat_user_id_fkey" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_blocks" ADD CONSTRAINT "chat_blocks_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_blocks" ADD CONSTRAINT "chat_blocks_chat_user_blocks_id_fkey" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
