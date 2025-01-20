/*
  Warnings:

  - You are about to drop the column `file_upload` on the `Files` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Files` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Files` DROP COLUMN `file_upload`,
    DROP COLUMN `size`,
    DROP COLUMN `type`,
    ADD COLUMN `file` VARCHAR(191) NULL,
    ADD COLUMN `size_file` INTEGER NULL,
    ADD COLUMN `size_image` INTEGER NULL,
    ADD COLUMN `type_file` VARCHAR(191) NULL,
    ADD COLUMN `type_image` VARCHAR(191) NULL;
