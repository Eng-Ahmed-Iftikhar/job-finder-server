/*
  Warnings:

  - You are about to drop the column `user_id` on the `chats` table. All the data in the column will be lost.
  - Added the required column `chat_user_id` to the `chats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."chats" DROP CONSTRAINT "chats_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."chats" DROP COLUMN "user_id",
ADD COLUMN     "chat_user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_chat_user_id_fkey" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
