/*
  Warnings:

  - You are about to drop the column `isEmailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "isEmailVerified",
DROP COLUMN "role";
