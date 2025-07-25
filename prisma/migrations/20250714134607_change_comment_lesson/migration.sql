/*
  Warnings:

  - You are about to drop the column `courseId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `lessonId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_courseId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "courseId",
ADD COLUMN     "lessonId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
