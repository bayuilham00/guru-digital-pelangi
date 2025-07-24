-- AlterTable
ALTER TABLE `attendances` ADD COLUMN `subject_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX `attendances_student_id_class_id_date_subject_id_key` ON `attendances`(`student_id`, `class_id`, `date`, `subject_id`);
