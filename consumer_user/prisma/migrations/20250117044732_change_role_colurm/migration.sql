/*
  Warnings:

  - You are about to drop the column `type_role` on the `Roles` table. All the data in the column will be lost.
  - You are about to drop the column `roleType` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[role]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `Roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_roleType_fkey`;

-- DropIndex
DROP INDEX `Roles_type_role_key` ON `Roles`;

-- DropIndex
DROP INDEX `User_roleType_fkey` ON `User`;

-- AlterTable
ALTER TABLE `Roles` DROP COLUMN `type_role`,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `roleType`,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Roles_role_key` ON `Roles`(`role`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_fkey` FOREIGN KEY (`role`) REFERENCES `Roles`(`role`) ON DELETE CASCADE ON UPDATE CASCADE;
