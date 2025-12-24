-- CreateEnum
CREATE TYPE "public"."ChatType" AS ENUM ('PRIVATE', 'GROUP');

-- CreateEnum
CREATE TYPE "public"."ChatUserRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'FILE');

-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "public"."chats" (
    "id" TEXT NOT NULL,
    "type" "public"."ChatType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_users" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."ChatUserRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "last_read_message_id" TEXT,
    "muted_until" TIMESTAMP(3),

    CONSTRAINT "chat_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_groups" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chat_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "text" TEXT,
    "file_url" TEXT,
    "message_type" "public"."MessageType" NOT NULL DEFAULT 'TEXT',
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_replies" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "reply_to_id" TEXT,
    "user_id" TEXT NOT NULL,
    "text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "message_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_user_status" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "received_at" TIMESTAMP(3),
    "seen_at" TIMESTAMP(3),

    CONSTRAINT "message_user_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_blocks" (
    "id" TEXT NOT NULL,
    "blocked_by" TEXT NOT NULL,
    "blocked_to" TEXT NOT NULL,
    "chat_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chat_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_users_user_id_key" ON "public"."chat_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_users_chat_id_user_id_key" ON "public"."chat_users"("chat_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_groups_chat_id_key" ON "public"."chat_groups"("chat_id");

-- CreateIndex
CREATE INDEX "chat_messages_chat_id_created_at_idx" ON "public"."chat_messages"("chat_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_message_id_user_id_emoji_key" ON "public"."message_reactions"("message_id", "user_id", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX "message_user_status_message_id_user_id_key" ON "public"."message_user_status"("message_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_blocks_blocked_by_blocked_to_chat_id_key" ON "public"."chat_blocks"("blocked_by", "blocked_to", "chat_id");

-- AddForeignKey
ALTER TABLE "public"."chat_users" ADD CONSTRAINT "chat_users_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_users" ADD CONSTRAINT "chat_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_users" ADD CONSTRAINT "chat_users_last_read_message_id_fkey" FOREIGN KEY ("last_read_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_groups" ADD CONSTRAINT "chat_groups_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_replies" ADD CONSTRAINT "message_replies_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_replies" ADD CONSTRAINT "message_replies_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_replies" ADD CONSTRAINT "message_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_user_status" ADD CONSTRAINT "message_user_status_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_user_status" ADD CONSTRAINT "message_user_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_user_status" ADD CONSTRAINT "message_user_status_chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."chat_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_blocks" ADD CONSTRAINT "chat_blocks_blocked_by_fkey" FOREIGN KEY ("blocked_by") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_blocks" ADD CONSTRAINT "chat_blocks_blocked_to_fkey" FOREIGN KEY ("blocked_to") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_blocks" ADD CONSTRAINT "chat_blocks_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
