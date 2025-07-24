-- AlterTable
ALTER TABLE `assignments` ADD COLUMN `subject_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `challenges` MODIFY `end_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
