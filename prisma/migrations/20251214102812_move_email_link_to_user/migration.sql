/*
  Move email relation to users.emailId with backfill:
  1) Add users.emailId (nullable)
  2) Backfill users.emailId from emails.userId (pick earliest by createdAt)
  3) Add unique index and foreign key
  4) Drop old emails.userId FK, index, and column
*/

-- 1) Add emailId column to users
ALTER TABLE "public"."users" ADD COLUMN "emailId" TEXT;

-- 2) Backfill: pick one email per user (earliest createdAt)
WITH chosen AS (
  SELECT DISTINCT ON (e."userId") e."userId", e."id"
  FROM "public"."emails" e
  WHERE e."userId" IS NOT NULL
  ORDER BY e."userId", e."createdAt" ASC
)
UPDATE "public"."users" u
SET "emailId" = c."id"
FROM chosen c
WHERE c."userId" = u."id" AND u."emailId" IS NULL;

-- 3) Add unique index and FK on users.emailId
CREATE UNIQUE INDEX "users_emailId_key" ON "public"."users"("emailId");
ALTER TABLE "public"."users" ADD CONSTRAINT "users_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."emails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4) Drop old FK/index/column on emails.userId
ALTER TABLE "public"."emails" DROP CONSTRAINT IF EXISTS "emails_userId_fkey";
DROP INDEX IF EXISTS "public"."emails_userId_idx";
ALTER TABLE "public"."emails" DROP COLUMN IF EXISTS "userId";
