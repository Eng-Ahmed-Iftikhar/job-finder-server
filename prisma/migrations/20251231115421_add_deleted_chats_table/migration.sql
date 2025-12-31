-- CreateTable
CREATE TABLE "public"."deleted_chats" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "chat_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "deleted_chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deleted_chats_chat_id_key" ON "public"."deleted_chats"("chat_id");

-- AddForeignKey
ALTER TABLE "public"."deleted_chats" ADD CONSTRAINT "deleted_chats_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deleted_chats" ADD CONSTRAINT "deleted_chats_chat_user_id_fkey" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
