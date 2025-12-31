/*
  Warnings:

  - You are about to drop the column `chat_user_id` on the `chats` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."chats" DROP CONSTRAINT "chats_chat_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."chats" DROP COLUMN "chat_user_id";
