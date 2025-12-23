/*
  Warnings:

  - You are about to drop the column `employee_id` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `employer_id` on the `connections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sender_id,receiver_id]` on the table `connections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiver_id` to the `connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `connections` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."connections" DROP CONSTRAINT "connections_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."connections" DROP CONSTRAINT "connections_employer_id_fkey";

-- DropIndex
DROP INDEX "public"."connections_employee_id_employer_id_key";

-- AlterTable
ALTER TABLE "public"."connections" DROP COLUMN "employee_id",
DROP COLUMN "employer_id",
ADD COLUMN     "connection_request_id" TEXT,
ADD COLUMN     "receiver_id" TEXT NOT NULL,
ADD COLUMN     "sender_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "connections_sender_id_receiver_id_key" ON "public"."connections"("sender_id", "receiver_id");

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_connection_request_id_fkey" FOREIGN KEY ("connection_request_id") REFERENCES "public"."connection_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
