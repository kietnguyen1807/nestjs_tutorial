/*
  Warnings:

  - You are about to drop the column `createdDate` on the `Files` table. All the data in the column will be lost.
  - You are about to drop the column `updatedDate` on the `Files` table. All the data in the column will be lost.
  - Added the required column `size` to the `Files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Files` DROP COLUMN `createdDate`,
    DROP COLUMN `updatedDate`,
    ADD COLUMN `size` DOUBLE NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;
