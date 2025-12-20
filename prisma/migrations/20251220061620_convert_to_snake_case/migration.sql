/*
  Warnings:

  - You are about to drop the column `createdAt` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `company_followers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `company_followers` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `company_followers` table. All the data in the column will be lost.
  - You are about to drop the column `followerId` on the `company_followers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `company_followers` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `employerId` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `pictureUrl` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `websiteId` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `connection_requests` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `connection_requests` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `connection_requests` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `connection_requests` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `connection_requests` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `employerId` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `fieldOfStudy` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `inProgress` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `yearGraduated` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `yearStarted` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `emails` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrent` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `coverLetter` on the `job_employees` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `job_employees` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `job_employees` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `job_employees` table. All the data in the column will be lost.
  - You are about to drop the column `hiredAt` on the `job_employees` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `job_employees` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `job_employees` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `job_employers` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `job_employers` table. All the data in the column will be lost.
  - You are about to drop the column `employerId` on the `job_employers` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `job_employers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `job_employers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `hiringStatus` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `publishAt` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `wageRate` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `workMode` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `connectionRequestEmail` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `connectionRequestSystem` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `interviewReminderEmail` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `interviewReminderSystem` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `jobInterviewScheduledEmail` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `jobInterviewScheduledSystem` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `newJobOpeningEmail` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `newJobOpeningSystem` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `profile_skills` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `profile_skills` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `profile_skills` table. All the data in the column will be lost.
  - You are about to drop the column `skillId` on the `profile_skills` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `isOnboarded` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `pictureUrl` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `saved_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `saved_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `saved_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `saved_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `saved_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user_phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `user_phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumberId` on the `user_phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `user_phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_phone_numbers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `verification_codes` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `verification_codes` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `verification_codes` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `verification_codes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `verification_codes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `verification_codes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `websites` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `websites` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `websites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_id,follower_id]` on the table `company_followers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id]` on the table `company_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employee_id,employer_id]` on the table `connections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[job_id,employee_id]` on the table `job_employees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[job_id,employer_id]` on the table `job_employers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_id]` on the table `notification_settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_id,skill_id]` on the table `profile_skills` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[job_id,employee_id]` on the table `saved_jobs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_id,phone_number_id]` on the table `user_phone_numbers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `company_followers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `follower_id` to the `company_followers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `company_followers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `company_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employer_id` to the `company_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `company_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiver_id` to the `connection_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `connection_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `connection_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employee_id` to the `connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employer_id` to the `connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year_started` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `emails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employee_id` to the `job_employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_id` to the `job_employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `job_employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employer_id` to the `job_employers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_id` to the `job_employers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `job_employers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `notification_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `notification_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country_code` to the `phone_numbers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `phone_numbers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `profile_skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill_id` to the `profile_skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employee_id` to the `saved_jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_id` to the `saved_jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `saved_jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number_id` to the `user_phone_numbers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `user_phone_numbers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_phone_numbers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `verification_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `verification_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `verification_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `websites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."company_followers" DROP CONSTRAINT "company_followers_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."company_followers" DROP CONSTRAINT "company_followers_followerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."company_profiles" DROP CONSTRAINT "company_profiles_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."company_profiles" DROP CONSTRAINT "company_profiles_employerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."company_profiles" DROP CONSTRAINT "company_profiles_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."company_profiles" DROP CONSTRAINT "company_profiles_websiteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."connection_requests" DROP CONSTRAINT "connection_requests_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."connection_requests" DROP CONSTRAINT "connection_requests_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."connections" DROP CONSTRAINT "connections_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."connections" DROP CONSTRAINT "connections_employerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."educations" DROP CONSTRAINT "educations_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."experiences" DROP CONSTRAINT "experiences_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_employees" DROP CONSTRAINT "job_employees_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_employees" DROP CONSTRAINT "job_employees_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_employers" DROP CONSTRAINT "job_employers_employerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_employers" DROP CONSTRAINT "job_employers_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobs" DROP CONSTRAINT "jobs_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notification_settings" DROP CONSTRAINT "notification_settings_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_skills" DROP CONSTRAINT "profile_skills_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_skills" DROP CONSTRAINT "profile_skills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."saved_jobs" DROP CONSTRAINT "saved_jobs_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."saved_jobs" DROP CONSTRAINT "saved_jobs_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_phone_numbers" DROP CONSTRAINT "user_phone_numbers_phoneNumberId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_phone_numbers" DROP CONSTRAINT "user_phone_numbers_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_emailId_fkey";

-- DropForeignKey
ALTER TABLE "public"."verification_codes" DROP CONSTRAINT "verification_codes_userId_fkey";

-- DropIndex
DROP INDEX "public"."company_followers_companyId_followerId_key";

-- DropIndex
DROP INDEX "public"."company_profiles_companyId_key";

-- DropIndex
DROP INDEX "public"."connections_employeeId_employerId_key";

-- DropIndex
DROP INDEX "public"."job_employees_jobId_employeeId_key";

-- DropIndex
DROP INDEX "public"."job_employers_jobId_employerId_key";

-- DropIndex
DROP INDEX "public"."notification_settings_profileId_key";

-- DropIndex
DROP INDEX "public"."profile_skills_profileId_skillId_key";

-- DropIndex
DROP INDEX "public"."profiles_userId_key";

-- DropIndex
DROP INDEX "public"."saved_jobs_jobId_employeeId_key";

-- DropIndex
DROP INDEX "public"."user_phone_numbers_profileId_phoneNumberId_key";

-- DropIndex
DROP INDEX "public"."users_emailId_key";

-- AlterTable
ALTER TABLE "public"."companies" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."company_followers" DROP COLUMN "companyId",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "followerId",
DROP COLUMN "updatedAt",
ADD COLUMN     "company_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "follower_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."company_profiles" DROP COLUMN "companyId",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "employerId",
DROP COLUMN "locationId",
DROP COLUMN "pictureUrl",
DROP COLUMN "updatedAt",
DROP COLUMN "websiteId",
ADD COLUMN     "company_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "employer_id" TEXT NOT NULL,
ADD COLUMN     "location_id" TEXT,
ADD COLUMN     "picture_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "website_id" TEXT;

-- AlterTable
ALTER TABLE "public"."connection_requests" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "receiverId",
DROP COLUMN "senderId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "receiver_id" TEXT NOT NULL,
ADD COLUMN     "sender_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."connections" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "employeeId",
DROP COLUMN "employerId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "employee_id" TEXT NOT NULL,
ADD COLUMN     "employer_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."educations" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "fieldOfStudy",
DROP COLUMN "inProgress",
DROP COLUMN "profileId",
DROP COLUMN "updatedAt",
DROP COLUMN "yearGraduated",
DROP COLUMN "yearStarted",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "field_of_study" TEXT,
ADD COLUMN     "in_progress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "year_graduated" INTEGER,
ADD COLUMN     "year_started" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."emails" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "isVerified",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."experiences" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "endDate",
DROP COLUMN "isCurrent",
DROP COLUMN "profileId",
DROP COLUMN "startDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "is_current" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_id" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."job_employees" DROP COLUMN "coverLetter",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "employeeId",
DROP COLUMN "hiredAt",
DROP COLUMN "jobId",
DROP COLUMN "updatedAt",
ADD COLUMN     "cover_letter" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "employee_id" TEXT NOT NULL,
ADD COLUMN     "hired_at" TIMESTAMP(3),
ADD COLUMN     "job_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."job_employers" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "employerId",
DROP COLUMN "jobId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "employer_id" TEXT NOT NULL,
ADD COLUMN     "job_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."jobs" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "hiringStatus",
DROP COLUMN "jobType",
DROP COLUMN "locationId",
DROP COLUMN "publishAt",
DROP COLUMN "updatedAt",
DROP COLUMN "wageRate",
DROP COLUMN "workMode",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "hiring_status" "public"."HiringStatus" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "job_type" "public"."JobType",
ADD COLUMN     "location_id" TEXT,
ADD COLUMN     "publish_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wage_rate" "public"."WageRate",
ADD COLUMN     "work_mode" "public"."WorkMode";

-- AlterTable
ALTER TABLE "public"."locations" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."notification_settings" DROP COLUMN "connectionRequestEmail",
DROP COLUMN "connectionRequestSystem",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "interviewReminderEmail",
DROP COLUMN "interviewReminderSystem",
DROP COLUMN "jobInterviewScheduledEmail",
DROP COLUMN "jobInterviewScheduledSystem",
DROP COLUMN "newJobOpeningEmail",
DROP COLUMN "newJobOpeningSystem",
DROP COLUMN "profileId",
DROP COLUMN "updatedAt",
ADD COLUMN     "connection_request_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "connection_request_system" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "interview_reminder_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "interview_reminder_system" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "job_interview_scheduled_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "job_interview_scheduled_system" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_job_opening_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_job_opening_system" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profile_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."phone_numbers" DROP COLUMN "countryCode",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "isVerified",
DROP COLUMN "updatedAt",
ADD COLUMN     "country_code" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."profile_skills" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "profileId",
DROP COLUMN "skillId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "profile_id" TEXT NOT NULL,
ADD COLUMN     "skill_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "firstName",
DROP COLUMN "isOnboarded",
DROP COLUMN "lastName",
DROP COLUMN "locationId",
DROP COLUMN "pictureUrl",
DROP COLUMN "resumeUrl",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "location_id" TEXT,
ADD COLUMN     "picture_url" TEXT,
ADD COLUMN     "resume_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."saved_jobs" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "employeeId",
DROP COLUMN "jobId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "employee_id" TEXT NOT NULL,
ADD COLUMN     "job_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."skills" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_phone_numbers" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "phoneNumberId",
DROP COLUMN "profileId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "phone_number_id" TEXT NOT NULL,
ADD COLUMN     "profile_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "emailId",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "email_id" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."verification_codes" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "expiresAt",
DROP COLUMN "isUsed",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."websites" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "company_followers_company_id_follower_id_key" ON "public"."company_followers"("company_id", "follower_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_company_id_key" ON "public"."company_profiles"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "connections_employee_id_employer_id_key" ON "public"."connections"("employee_id", "employer_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_employees_job_id_employee_id_key" ON "public"."job_employees"("job_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_employers_job_id_employer_id_key" ON "public"."job_employers"("job_id", "employer_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_profile_id_key" ON "public"."notification_settings"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_skills_profile_id_skill_id_key" ON "public"."profile_skills"("profile_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_job_id_employee_id_key" ON "public"."saved_jobs"("job_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_numbers_profile_id_phone_number_id_key" ON "public"."user_phone_numbers"("profile_id", "phone_number_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_id_key" ON "public"."users"("email_id");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verification_codes" ADD CONSTRAINT "verification_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."experiences" ADD CONSTRAINT "experiences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."educations" ADD CONSTRAINT "educations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_skills" ADD CONSTRAINT "profile_skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_skills" ADD CONSTRAINT "profile_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_phone_numbers" ADD CONSTRAINT "user_phone_numbers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_phone_numbers" ADD CONSTRAINT "user_phone_numbers_phone_number_id_fkey" FOREIGN KEY ("phone_number_id") REFERENCES "public"."phone_numbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_followers" ADD CONSTRAINT "company_followers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_followers" ADD CONSTRAINT "company_followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_profiles" ADD CONSTRAINT "company_profiles_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_profiles" ADD CONSTRAINT "company_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_profiles" ADD CONSTRAINT "company_profiles_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_profiles" ADD CONSTRAINT "company_profiles_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_jobs" ADD CONSTRAINT "saved_jobs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_employers" ADD CONSTRAINT "job_employers_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_employers" ADD CONSTRAINT "job_employers_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_employees" ADD CONSTRAINT "job_employees_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_employees" ADD CONSTRAINT "job_employees_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_settings" ADD CONSTRAINT "notification_settings_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection_requests" ADD CONSTRAINT "connection_requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection_requests" ADD CONSTRAINT "connection_requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
