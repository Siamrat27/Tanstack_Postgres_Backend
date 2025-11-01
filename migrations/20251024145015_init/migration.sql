/*
  Warnings:

  - You are about to drop the column `reading_first_name` on the `Graduate` table. All the data in the column will be lost.
  - You are about to drop the column `reading_last_name` on the `Graduate` table. All the data in the column will be lost.
  - You are about to drop the `Todo` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('rehearsal1', 'rehearsal2', 'ceremony', 'special');

-- DropIndex
DROP INDEX "CCR"."Graduate_barcode_key";

-- AlterTable
ALTER TABLE "Graduate" DROP COLUMN "reading_first_name",
DROP COLUMN "reading_last_name",
ADD COLUMN     "karaoke_first_name" TEXT,
ADD COLUMN     "karaoke_last_name" TEXT;

-- DropTable
DROP TABLE "CCR"."Todo";

-- CreateTable
CREATE TABLE "Diploma" (
    "id" SERIAL NOT NULL,
    "degree_th" TEXT,
    "degree_en" TEXT,
    "major_th" TEXT,
    "major_en" TEXT,
    "faculty_code" TEXT,
    "honor" TEXT,
    "honor_code" INTEGER,
    "degree_code" INTEGER,
    "student_id" TEXT,
    "graduate_id" INTEGER,
    "barcode" TEXT,
    "extra_attend" BOOLEAN,
    "eligible_receive" BOOLEAN,
    "order_no" INTEGER,
    "order_display" TEXT,
    "rehearsal_seat_no" TEXT,

    CONSTRAINT "Diploma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "role" TEXT,
    "faculty_code" TEXT,
    "from_cunet" BOOLEAN DEFAULT false,
    "can_manage_undergrad_level" BOOLEAN DEFAULT false,
    "can_manage_graduate_level" BOOLEAN DEFAULT false,
    "password_hash" TEXT,
    "password_salt" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "faculty_code" TEXT,
    "diploma_id" INTEGER,
    "order_start" INTEGER,
    "order_end" INTEGER,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "round_code" INTEGER,
    "time" TIMESTAMP(3),
    "round_type" "RoundType" NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "round_id" INTEGER NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attend" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "is_first" BOOLEAN,
    "is_last" BOOLEAN,

    CONSTRAINT "Attend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" SERIAL NOT NULL,
    "faculty_code" TEXT NOT NULL,
    "faculty_name" TEXT,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Diploma_graduate_id_idx" ON "Diploma"("graduate_id");

-- CreateIndex
CREATE INDEX "Diploma_student_id_idx" ON "Diploma"("student_id");

-- CreateIndex
CREATE INDEX "Diploma_faculty_code_idx" ON "Diploma"("faculty_code");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_faculty_code_idx" ON "User"("faculty_code");

-- CreateIndex
CREATE INDEX "Group_faculty_code_idx" ON "Group"("faculty_code");

-- CreateIndex
CREATE INDEX "Group_diploma_id_idx" ON "Group"("diploma_id");

-- CreateIndex
CREATE INDEX "Round_round_code_idx" ON "Round"("round_code");

-- CreateIndex
CREATE INDEX "Schedule_round_id_date_idx" ON "Schedule"("round_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Attend_group_id_schedule_id_key" ON "Attend"("group_id", "schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_faculty_code_key" ON "Faculty"("faculty_code");

-- CreateIndex
CREATE INDEX "Graduate_student_id_idx" ON "Graduate"("student_id");

-- AddForeignKey
ALTER TABLE "Diploma" ADD CONSTRAINT "Diploma_graduate_id_fkey" FOREIGN KEY ("graduate_id") REFERENCES "Graduate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diploma" ADD CONSTRAINT "Diploma_faculty_code_fkey" FOREIGN KEY ("faculty_code") REFERENCES "Faculty"("faculty_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_faculty_code_fkey" FOREIGN KEY ("faculty_code") REFERENCES "Faculty"("faculty_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_faculty_code_fkey" FOREIGN KEY ("faculty_code") REFERENCES "Faculty"("faculty_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_diploma_id_fkey" FOREIGN KEY ("diploma_id") REFERENCES "Diploma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attend" ADD CONSTRAINT "Attend_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attend" ADD CONSTRAINT "Attend_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
