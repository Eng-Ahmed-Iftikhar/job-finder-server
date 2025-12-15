/*
  Custom migration with data backfill to support schema changes:
  - Create phone_numbers and populate from existing user_phone_numbers
  - Add nullable phoneNumberId, backfill, then make NOT NULL
  - Create emails and populate from users (+ profiles.isEmailVerified), then drop old columns
*/

-- 1) Drop FK relying on userId since we'll remove that column
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE c.conname = 'user_phone_numbers_userId_fkey' AND t.relname = 'user_phone_numbers'
  ) THEN
    ALTER TABLE "public"."user_phone_numbers" DROP CONSTRAINT "user_phone_numbers_userId_fkey";
  END IF;
END $$;

-- 2) Create phone_numbers table
CREATE TABLE IF NOT EXISTS "public"."phone_numbers" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- 3) Backfill phone_numbers with distinct numbers from user_phone_numbers
INSERT INTO "public"."phone_numbers" ("id", "countryCode", "number", "isVerified", "createdAt", "updatedAt")
SELECT md5(upn."countryCode" || ':' || upn."number")::text AS id,
       upn."countryCode",
       upn."number",
       COALESCE(bool_or(upn."isVerified"), false) AS isVerified,
       NOW(), NOW()
FROM "public"."user_phone_numbers" upn
GROUP BY upn."countryCode", upn."number"
ON CONFLICT DO NOTHING;

-- 4) Add phoneNumberId column as NULL-able first, so existing rows are allowed
DO $$ BEGIN
  BEGIN
    ALTER TABLE "public"."user_phone_numbers" ADD COLUMN "phoneNumberId" TEXT;
  EXCEPTION WHEN duplicate_column THEN
    -- already added in a previous attempt
    NULL;
  END;
END $$;

-- 5) Backfill phoneNumberId by joining on countryCode+number
UPDATE "public"."user_phone_numbers" upn
SET "phoneNumberId" = pn."id"
FROM "public"."phone_numbers" pn
WHERE pn."countryCode" = upn."countryCode" AND pn."number" = upn."number" AND upn."phoneNumberId" IS NULL;

-- 6) Now drop old columns from user_phone_numbers
DO $$ BEGIN
  BEGIN
    ALTER TABLE "public"."user_phone_numbers"
      DROP COLUMN IF EXISTS "countryCode",
      DROP COLUMN IF EXISTS "isVerified",
      DROP COLUMN IF EXISTS "number",
      DROP COLUMN IF EXISTS "userId";
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END;
END $$;

-- 7) Make phoneNumberId NOT NULL
ALTER TABLE "public"."user_phone_numbers" ALTER COLUMN "phoneNumberId" SET NOT NULL;

-- 8) Create emails table
CREATE TABLE IF NOT EXISTS "public"."emails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "provider" "public"."SocialProvider",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- 9) Backfill emails from users (and profiles for isEmailVerified)
INSERT INTO "public"."emails" ("id", "userId", "email", "isVerified", "provider", "createdAt", "updatedAt")
SELECT md5(u."email")::text AS id,
       u."id"          AS userId,
       u."email"       AS email,
       COALESCE(p."isEmailVerified", false) AS isVerified,
       u."socialProvider" AS provider,
       NOW(), NOW()
FROM "public"."users" u
LEFT JOIN "public"."profiles" p ON p."userId" = u."id"
WHERE u."email" IS NOT NULL;

-- 10) Drop unique index on users.email, then drop columns on users & profiles
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'users_email_key') THEN
    DROP INDEX "public"."users_email_key";
  END IF;
END $$;

ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "email";
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "socialProvider";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "isEmailVerified";

-- 11) Create indexes & constraints
CREATE UNIQUE INDEX IF NOT EXISTS "emails_email_key" ON "public"."emails"("email");
CREATE INDEX IF NOT EXISTS "emails_userId_idx" ON "public"."emails"("userId");

-- Unique constraint on join table
DO $$ BEGIN
  BEGIN
    CREATE UNIQUE INDEX "user_phone_numbers_profileId_phoneNumberId_key" ON "public"."user_phone_numbers"("profileId", "phoneNumberId");
  EXCEPTION WHEN duplicate_table THEN
    NULL;
  END;
END $$;

-- 12) Foreign keys
DO $$ BEGIN
  BEGIN
    ALTER TABLE "public"."emails" ADD CONSTRAINT "emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

DO $$ BEGIN
  BEGIN
    ALTER TABLE "public"."user_phone_numbers" ADD CONSTRAINT "user_phone_numbers_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "public"."phone_numbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
