/*
  Warnings:

  - You are about to drop the column `receiver_id` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `connections` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."connections" DROP CONSTRAINT "connections_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."connections" DROP CONSTRAINT "connections_sender_id_fkey";

-- DropIndex
DROP INDEX "public"."connections_sender_id_receiver_id_key";

-- AlterTable
ALTER TABLE "public"."connections" DROP COLUMN "receiver_id",
DROP COLUMN "sender_id";
