/*
  Warnings:

  - Added the required column `type` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `answer` on the `Quiz` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('FILL', 'SINGLE_CHOICE', 'MULTI_CHOICE');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "type" "QuizType" NOT NULL,
ALTER COLUMN "options" DROP NOT NULL,
DROP COLUMN "answer",
ADD COLUMN     "answer" JSONB NOT NULL;
