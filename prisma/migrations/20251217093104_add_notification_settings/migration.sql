-- CreateTable
CREATE TABLE "public"."notification_settings" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "jobInterviewScheduledSystem" BOOLEAN NOT NULL DEFAULT true,
    "jobInterviewScheduledEmail" BOOLEAN NOT NULL DEFAULT true,
    "connectionRequestSystem" BOOLEAN NOT NULL DEFAULT true,
    "connectionRequestEmail" BOOLEAN NOT NULL DEFAULT true,
    "newJobOpeningSystem" BOOLEAN NOT NULL DEFAULT true,
    "newJobOpeningEmail" BOOLEAN NOT NULL DEFAULT true,
    "interviewReminderSystem" BOOLEAN NOT NULL DEFAULT false,
    "interviewReminderEmail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_profileId_key" ON "public"."notification_settings"("profileId");

-- AddForeignKey
ALTER TABLE "public"."notification_settings" ADD CONSTRAINT "notification_settings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
