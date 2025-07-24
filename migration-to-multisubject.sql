-- ==========================================
-- GURU DIGITAL PELANGI - MULTI-SUBJECT MIGRATION
-- ==========================================
-- This script migrates from single-subject to multi-subject classes
-- Date: 2025-07-16
-- 
-- IMPORTANT: Run backup-database.ps1 BEFORE executing this script!
-- ==========================================

SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- STEP 1: CREATE NEW TABLES
-- ==========================================

-- Table: class_subjects (Junction table for Class <-> Subject)
CREATE TABLE IF NOT EXISTS `class_subjects` (
  `id` VARCHAR(191) NOT NULL,
  `class_id` VARCHAR(191) NOT NULL,
  `subject_id` VARCHAR(191) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `class_subjects_class_id_subject_id_key` (`class_id`, `subject_id`),
  INDEX `class_subjects_class_id_idx` (`class_id`),
  INDEX `class_subjects_subject_id_idx` (`subject_id`),
  
  CONSTRAINT `class_subjects_class_id_fkey` 
    FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_subjects_subject_id_fkey` 
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: class_teacher_subjects (Teachers assigned to specific class-subject combinations)
CREATE TABLE IF NOT EXISTS `class_teacher_subjects` (
  `id` VARCHAR(191) NOT NULL,
  `class_id` VARCHAR(191) NOT NULL,
  `teacher_id` VARCHAR(191) NOT NULL,
  `subject_id` VARCHAR(191) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `class_teacher_subjects_class_id_teacher_id_subject_id_key` (`class_id`, `teacher_id`, `subject_id`),
  INDEX `class_teacher_subjects_class_id_idx` (`class_id`),
  INDEX `class_teacher_subjects_teacher_id_idx` (`teacher_id`),
  INDEX `class_teacher_subjects_subject_id_idx` (`subject_id`),
  
  CONSTRAINT `class_teacher_subjects_class_id_fkey` 
    FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_teacher_subjects_teacher_id_fkey` 
    FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_teacher_subjects_subject_id_fkey` 
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: student_subject_enrollments (Students enrolled in specific class-subject combinations)
CREATE TABLE IF NOT EXISTS `student_subject_enrollments` (
  `id` VARCHAR(191) NOT NULL,
  `student_id` VARCHAR(191) NOT NULL,
  `class_id` VARCHAR(191) NOT NULL,
  `subject_id` VARCHAR(191) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `student_subject_enrollments_student_id_class_id_subject_id_key` (`student_id`, `class_id`, `subject_id`),
  INDEX `student_subject_enrollments_student_id_idx` (`student_id`),
  INDEX `student_subject_enrollments_class_id_idx` (`class_id`),
  INDEX `student_subject_enrollments_subject_id_idx` (`subject_id`),
  
  CONSTRAINT `student_subject_enrollments_student_id_fkey` 
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_subject_enrollments_class_id_fkey` 
    FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_subject_enrollments_subject_id_fkey` 
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- STEP 2: MIGRATE EXISTING DATA
-- ==========================================

-- 2.1: Migrate Class-Subject relationships
-- For each class that has a subject, create a ClassSubject entry
INSERT INTO `class_subjects` (`id`, `class_id`, `subject_id`, `is_active`, `created_at`, `updated_at`)
SELECT 
  CONCAT('cs_', SUBSTRING(MD5(CONCAT(c.id, c.subject_id)), 1, 20)) as id,
  c.id as class_id,
  c.subject_id as subject_id,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM `classes` c
WHERE c.subject_id IS NOT NULL
  AND c.subject_id != ''
  AND NOT EXISTS (
    SELECT 1 FROM `class_subjects` cs 
    WHERE cs.class_id = c.id AND cs.subject_id = c.subject_id
  );

-- 2.2: Migrate Teacher assignments to specific class-subject combinations
-- Convert existing ClassTeacher relationships to ClassTeacherSubject
INSERT INTO `class_teacher_subjects` (`id`, `class_id`, `teacher_id`, `subject_id`, `is_active`, `created_at`, `updated_at`)
SELECT 
  CONCAT('cts_', SUBSTRING(MD5(CONCAT(ct.class_id, ct.teacher_id, c.subject_id)), 1, 20)) as id,
  ct.class_id,
  ct.teacher_id,
  c.subject_id,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM `class_teachers` ct
JOIN `classes` c ON ct.class_id = c.id
WHERE c.subject_id IS NOT NULL
  AND c.subject_id != ''
  AND NOT EXISTS (
    SELECT 1 FROM `class_teacher_subjects` cts 
    WHERE cts.class_id = ct.class_id 
      AND cts.teacher_id = ct.teacher_id 
      AND cts.subject_id = c.subject_id
  );

-- 2.3: Migrate Student enrollments to class-subject combinations
-- For each student in a class with a subject, create enrollment record
INSERT INTO `student_subject_enrollments` (`id`, `student_id`, `class_id`, `subject_id`, `is_active`, `enrolled_at`, `created_at`, `updated_at`)
SELECT 
  CONCAT('sse_', SUBSTRING(MD5(CONCAT(s.id, s.class_id, c.subject_id)), 1, 20)) as id,
  s.id as student_id,
  s.class_id,
  c.subject_id,
  true as is_active,
  s.created_at as enrolled_at,
  NOW() as created_at,
  NOW() as updated_at
FROM `students` s
JOIN `classes` c ON s.class_id = c.id
WHERE s.class_id IS NOT NULL
  AND c.subject_id IS NOT NULL
  AND c.subject_id != ''
  AND NOT EXISTS (
    SELECT 1 FROM `student_subject_enrollments` sse 
    WHERE sse.student_id = s.id 
      AND sse.class_id = s.class_id 
      AND sse.subject_id = c.subject_id
  );

-- ==========================================
-- STEP 3: ADD NEW FIELD TO CLASSES TABLE
-- ==========================================

-- Add is_physical_class field to distinguish physical classes from subject-specific classes
ALTER TABLE `classes` 
ADD COLUMN IF NOT EXISTS `is_physical_class` BOOLEAN NOT NULL DEFAULT true;

-- ==========================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_class_subjects_active` ON `class_subjects` (`is_active`);
CREATE INDEX IF NOT EXISTS `idx_class_teacher_subjects_active` ON `class_teacher_subjects` (`is_active`);
CREATE INDEX IF NOT EXISTS `idx_student_subject_enrollments_active` ON `student_subject_enrollments` (`is_active`);

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- STEP 5: VERIFY MIGRATION
-- ==========================================

-- Show migration summary
SELECT 
  'MIGRATION SUMMARY' as info,
  (SELECT COUNT(*) FROM classes WHERE subject_id IS NOT NULL) as classes_with_subjects,
  (SELECT COUNT(*) FROM class_subjects) as class_subject_relationships,
  (SELECT COUNT(*) FROM class_teacher_subjects) as teacher_subject_assignments,
  (SELECT COUNT(*) FROM student_subject_enrollments) as student_enrollments;

-- Show sample data
SELECT 'SAMPLE CLASS-SUBJECT RELATIONSHIPS:' as info;
SELECT 
  c.name as class_name,
  s.name as subject_name,
  cs.created_at
FROM class_subjects cs
JOIN classes c ON cs.class_id = c.id
JOIN subjects s ON cs.subject_id = s.id
LIMIT 5;

SELECT 'SAMPLE TEACHER-SUBJECT ASSIGNMENTS:' as info;
SELECT 
  c.name as class_name,
  u.full_name as teacher_name,
  s.name as subject_name,
  cts.created_at
FROM class_teacher_subjects cts
JOIN classes c ON cts.class_id = c.id
JOIN users u ON cts.teacher_id = u.id
JOIN subjects s ON cts.subject_id = s.id
LIMIT 5;

-- ==========================================
-- MIGRATION COMPLETED SUCCESSFULLY!
-- ==========================================
-- 
-- Next Steps:
-- 1. Update Prisma schema (schema.prisma)
-- 2. Run: npx prisma generate
-- 3. Update API routes to use new schema
-- 4. Update frontend components
-- 5. Test all functionality
-- 
-- ==========================================
