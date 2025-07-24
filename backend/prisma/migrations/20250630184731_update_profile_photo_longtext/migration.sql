/*
  Warnings:

  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `levels` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `students` ADD COLUMN `profile_photo` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `phone`;

-- DropTable
DROP TABLE `levels`;
