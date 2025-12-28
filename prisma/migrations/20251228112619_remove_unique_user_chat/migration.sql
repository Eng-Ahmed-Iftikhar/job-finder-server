-- DropForeignKey
ALTER TABLE "public"."message_user_status" DROP CONSTRAINT "message_user_status_chat_user_id_fkey";

-- DropIndex
DROP INDEX "public"."chat_users_user_id_key";
