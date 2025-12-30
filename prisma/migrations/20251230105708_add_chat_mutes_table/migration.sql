-- CreateTable
CREATE TABLE "public"."chat_mutes" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "chat_user_id" TEXT NOT NULL,
    "muted_till" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chat_mutes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_mutes_chat_id_chat_user_id_key" ON "public"."chat_mutes"("chat_id", "chat_user_id");

-- AddForeignKey
ALTER TABLE "public"."chat_mutes" ADD CONSTRAINT "chat_mutes_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_mutes" ADD CONSTRAINT "chat_mutes_chat_user_id_fkey" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
