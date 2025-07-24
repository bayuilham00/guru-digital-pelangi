-- Create migration for Level table
-- Migration: Add Level table for dynamic level management

-- CreateTable
CREATE TABLE `levels` (
    `id` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `xp_required` INTEGER NOT NULL,
    `benefits` TEXT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `levels_level_key`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default levels
INSERT INTO `levels` (`id`, `level`, `name`, `xp_required`, `benefits`, `is_active`, `created_at`, `updated_at`) VALUES
('level-1', 1, 'Pemula', 0, 'Akses dasar ke semua fitur', true, NOW(), NOW()),
('level-2', 2, 'Berkembang', 100, 'Akses ke quiz tambahan', true, NOW(), NOW()),
('level-3', 3, 'Mahir', 300, 'Akses ke materi advanced', true, NOW(), NOW()),
('level-4', 4, 'Ahli', 600, 'Akses ke proyek khusus', true, NOW(), NOW()),
('level-5', 5, 'Master', 1000, 'Akses ke semua fitur premium', true, NOW(), NOW()),
('level-6', 6, 'Grandmaster', 1500, 'Akses mentor untuk siswa lain', true, NOW(), NOW()),
('level-7', 7, 'Legend', 2200, 'Akses ke kompetisi eksklusif', true, NOW(), NOW()),
('level-8', 8, 'Mythic', 3000, 'Akses ke program beasiswa', true, NOW(), NOW()),
('level-9', 9, 'Divine', 4000, 'Akses ke universitas partner', true, NOW(), NOW()),
('level-10', 10, 'Immortal', 5500, 'Status legend sekolah', true, NOW(), NOW());
