-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "public"."WageRate" AS ENUM ('HOUR', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('ENABLE', 'DISABLE');

-- CreateEnum
CREATE TYPE "public"."JobEmployeeStatus" AS ENUM ('APPLIED', 'HIRED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "locationId" TEXT,
    "description" TEXT,
    "jobType" "public"."JobType",
    "wage" DECIMAL(65,30),
    "wageRate" "public"."WageRate",
    "status" "public"."JobStatus" NOT NULL DEFAULT 'ENABLE',
    "publishAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_employers" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "job_employers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_employees" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" "public"."JobEmployeeStatus" NOT NULL DEFAULT 'APPLIED',
    "hiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "job_employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_employers_jobId_employerId_key" ON "public"."job_employers"("jobId", "employerId");

-- CreateIndex
CREATE UNIQUE INDEX "job_employees_jobId_employeeId_key" ON "public"."job_employees"("jobId", "employeeId");

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_employers" ADD CONSTRAINT "job_employers_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_employers" ADD CONSTRAINT "job_employers_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_employees" ADD CONSTRAINT "job_employees_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_employees" ADD CONSTRAINT "job_employees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
