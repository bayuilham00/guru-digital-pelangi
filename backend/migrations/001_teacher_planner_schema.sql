-- ================================================
-- TEACHER PLANNER MODULE - DATABASE SCHEMA
-- ================================================
-- Created: July 4, 2025
-- Purpose: Database schema for Teacher Planner module
-- ================================================

-- Drop tables if exists (for clean setup)
DROP TABLE IF EXISTS ai_suggestions;
DROP TABLE IF EXISTS lesson_plan_resources;
DROP TABLE IF EXISTS teacher_plans;
DROP TABLE IF EXISTS lesson_templates;

-- ================================================
-- 1. LESSON TEMPLATES TABLE
-- ================================================
-- Stores reusable lesson plan templates
CREATE TABLE lesson_templates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id VARCHAR(36),
    template_structure JSON COMMENT 'Template structure with sections like opening, main_activity, closing',
    learning_objectives JSON COMMENT 'Array of learning objectives',
    estimated_duration INT COMMENT 'Duration in minutes',
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    grade_level VARCHAR(10) COMMENT 'e.g., 10, 11, 12',
    created_by VARCHAR(36) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE COMMENT 'Whether template is shared publicly',
    usage_count INT DEFAULT 0 COMMENT 'How many times template has been used',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_subject_id (subject_id),
    INDEX idx_created_by (created_by),
    INDEX idx_difficulty_level (difficulty_level),
    INDEX idx_is_public (is_public)
);

-- ================================================
-- 2. TEACHER PLANS TABLE
-- ================================================
-- Main table for storing lesson plans
CREATE TABLE teacher_plans (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    teacher_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36) NULL COMMENT 'Reference to template used (if any)',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id VARCHAR(36),
    class_id VARCHAR(36),
    planned_date DATE NOT NULL,
    planned_time TIME DEFAULT '07:30:00' COMMENT 'Lesson start time',
    duration_minutes INT DEFAULT 90 COMMENT 'Lesson duration in minutes',
    
    -- Learning Details
    learning_objectives JSON COMMENT 'Array of specific learning objectives',
    learning_activities JSON COMMENT 'Structured activities: opening, main, closing',
    assessment_methods JSON COMMENT 'How learning will be assessed',
    teaching_methods JSON COMMENT 'Teaching strategies to be used',
    
    -- Status & Metadata
    status ENUM('draft', 'planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    completion_notes TEXT COMMENT 'Notes after lesson completion',
    actual_duration INT COMMENT 'Actual duration when lesson completed',
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Foreign Keys
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES lesson_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_planned_date (planned_date),
    INDEX idx_status (status),
    INDEX idx_subject_id (subject_id),
    INDEX idx_class_id (class_id),
    INDEX idx_teacher_date (teacher_id, planned_date),
    
    -- Unique constraint to prevent double booking
    UNIQUE KEY unique_teacher_time (teacher_id, planned_date, planned_time, class_id)
);

-- ================================================
-- 3. LESSON PLAN RESOURCES TABLE
-- ================================================
-- Stores resources attached to lesson plans
CREATE TABLE lesson_plan_resources (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    lesson_plan_id VARCHAR(36) NOT NULL,
    resource_type ENUM('file', 'link', 'video', 'document', 'image') NOT NULL,
    resource_name VARCHAR(255) NOT NULL,
    resource_url TEXT COMMENT 'File path or external URL',
    file_size INT COMMENT 'File size in bytes',
    mime_type VARCHAR(100),
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE COMMENT 'Whether resource is required for lesson',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (lesson_plan_id) REFERENCES teacher_plans(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_lesson_plan_id (lesson_plan_id),
    INDEX idx_resource_type (resource_type)
);

-- ================================================
-- 4. AI SUGGESTIONS TABLE
-- ================================================
-- Stores AI-generated suggestions for lesson planning
CREATE TABLE ai_suggestions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    teacher_id VARCHAR(36) NOT NULL,
    lesson_plan_id VARCHAR(36) NULL COMMENT 'Associated lesson plan (if any)',
    suggestion_type ENUM('topic', 'activity', 'resource', 'timing', 'method', 'assessment') NOT NULL,
    context_data JSON COMMENT 'Context used to generate suggestion',
    suggestion_content JSON COMMENT 'The actual suggestion content',
    confidence_score DECIMAL(3,2) DEFAULT 0.00 COMMENT 'AI confidence level (0.00-1.00)',
    status ENUM('pending', 'accepted', 'rejected', 'modified') DEFAULT 'pending',
    teacher_feedback TEXT COMMENT 'Teacher feedback on suggestion',
    applied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_plan_id) REFERENCES teacher_plans(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_lesson_plan_id (lesson_plan_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_status (status),
    INDEX idx_confidence_score (confidence_score)
);

-- ================================================
-- 5. CURRICULUM STANDARDS TABLE (Optional for v1.2)
-- ================================================
-- Stores curriculum standards mapping
CREATE TABLE curriculum_standards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL COMMENT 'KD code like 3.1, 4.2, etc',
    title VARCHAR(500) NOT NULL,
    description TEXT,
    subject_id VARCHAR(36),
    grade_level VARCHAR(10),
    semester ENUM('1', '2') NOT NULL,
    competency_type ENUM('knowledge', 'skill', 'attitude') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_code (code),
    INDEX idx_subject_id (subject_id),
    INDEX idx_grade_level (grade_level),
    UNIQUE KEY unique_standard (code, subject_id, grade_level, semester)
);

-- ================================================
-- 6. LESSON PLAN STANDARDS MAPPING TABLE (Optional for v1.2)
-- ================================================
-- Maps lesson plans to curriculum standards
CREATE TABLE lesson_plan_standards (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    lesson_plan_id VARCHAR(36) NOT NULL,
    standard_id VARCHAR(36) NOT NULL,
    coverage_percentage INT DEFAULT 100 COMMENT 'How much of standard is covered (0-100)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (lesson_plan_id) REFERENCES teacher_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (standard_id) REFERENCES curriculum_standards(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_lesson_plan_id (lesson_plan_id),
    INDEX idx_standard_id (standard_id),
    UNIQUE KEY unique_mapping (lesson_plan_id, standard_id)
);

-- ================================================
-- SAMPLE DATA FOR TESTING
-- ================================================

-- Sample lesson template
INSERT INTO lesson_templates (
    id, name, description, subject_id, template_structure, 
    learning_objectives, estimated_duration, difficulty_level, 
    grade_level, created_by, is_public
) VALUES (
    'template-001',
    'Template Matematika Dasar',
    'Template standar untuk pelajaran matematika tingkat menengah',
    'subject-math',
    JSON_OBJECT(
        'opening', JSON_ARRAY('Salam dan doa', 'Review materi sebelumnya', 'Motivasi'),
        'main_activity', JSON_ARRAY('Penjelasan konsep', 'Contoh soal', 'Latihan mandiri', 'Diskusi'),
        'closing', JSON_ARRAY('Kesimpulan', 'Evaluasi', 'Tugas rumah', 'Penutup')
    ),
    JSON_ARRAY(
        'Siswa dapat memahami konsep dasar',
        'Siswa dapat menyelesaikan soal latihan',
        'Siswa dapat mengaplikasikan konsep dalam kehidupan sehari-hari'
    ),
    90,
    'intermediate',
    '10',
    'guru-1',
    TRUE
);

-- Sample teacher plan
INSERT INTO teacher_plans (
    id, teacher_id, template_id, title, description, subject_id, class_id,
    planned_date, planned_time, duration_minutes, learning_objectives,
    learning_activities, status
) VALUES (
    'plan-001',
    'guru-1',
    'template-001',
    'Persamaan Linear Satu Variabel',
    'Pembelajaran tentang konsep dan penyelesaian persamaan linear satu variabel',
    'subject-math',
    'class-10a',
    '2025-07-07',
    '07:30:00',
    90,
    JSON_ARRAY(
        'Siswa dapat memahami definisi persamaan linear satu variabel',
        'Siswa dapat menyelesaikan persamaan linear satu variabel',
        'Siswa dapat mengaplikasikan konsep dalam soal cerita'
    ),
    JSON_OBJECT(
        'opening', JSON_ARRAY('Salam dan doa (5 menit)', 'Review aljabar dasar (10 menit)'),
        'main_activity', JSON_ARRAY(
            'Penjelasan konsep persamaan linear (20 menit)',
            'Contoh penyelesaian soal (15 menit)',
            'Latihan mandiri (25 menit)',
            'Diskusi dan pembahasan (10 menit)'
        ),
        'closing', JSON_ARRAY('Kesimpulan (3 menit)', 'Tugas rumah (2 menit)')
    ),
    'planned'
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Composite indexes for common queries
CREATE INDEX idx_teacher_plans_teacher_month ON teacher_plans (teacher_id, planned_date);
CREATE INDEX idx_teacher_plans_class_date ON teacher_plans (class_id, planned_date);
CREATE INDEX idx_lesson_templates_subject_public ON lesson_templates (subject_id, is_public);

-- ================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================

-- View for teacher's weekly schedule
CREATE VIEW teacher_weekly_schedule AS
SELECT 
    tp.id,
    tp.title,
    tp.planned_date,
    tp.planned_time,
    tp.duration_minutes,
    tp.status,
    s.name as subject_name,
    c.name as class_name,
    u.fullName as teacher_name
FROM teacher_plans tp
LEFT JOIN subjects s ON tp.subject_id = s.id
LEFT JOIN classes c ON tp.class_id = c.id
LEFT JOIN users u ON tp.teacher_id = u.id
WHERE tp.status IN ('planned', 'in_progress');

-- View for lesson plan completion stats
CREATE VIEW teacher_plan_stats AS
SELECT 
    teacher_id,
    COUNT(*) as total_plans,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_plans,
    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_plans,
    AVG(duration_minutes) as avg_duration,
    DATE(created_at) as plan_date
FROM teacher_plans 
GROUP BY teacher_id, DATE(created_at);

-- ================================================
-- STORED PROCEDURES (Optional)
-- ================================================

DELIMITER //

-- Procedure to check schedule conflicts
CREATE PROCEDURE CheckScheduleConflict(
    IN p_teacher_id VARCHAR(36),
    IN p_planned_date DATE,
    IN p_planned_time TIME,
    IN p_duration_minutes INT,
    IN p_exclude_plan_id VARCHAR(36)
)
BEGIN
    DECLARE conflict_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO conflict_count
    FROM teacher_plans
    WHERE teacher_id = p_teacher_id
        AND planned_date = p_planned_date
        AND status NOT IN ('cancelled', 'completed')
        AND (p_exclude_plan_id IS NULL OR id != p_exclude_plan_id)
        AND (
            -- New lesson starts during existing lesson
            (p_planned_time >= planned_time AND 
             p_planned_time < ADDTIME(planned_time, SEC_TO_TIME(duration_minutes * 60)))
            OR
            -- New lesson ends during existing lesson
            (ADDTIME(p_planned_time, SEC_TO_TIME(p_duration_minutes * 60)) > planned_time AND
             ADDTIME(p_planned_time, SEC_TO_TIME(p_duration_minutes * 60)) <= ADDTIME(planned_time, SEC_TO_TIME(duration_minutes * 60)))
            OR
            -- New lesson completely covers existing lesson
            (p_planned_time <= planned_time AND
             ADDTIME(p_planned_time, SEC_TO_TIME(p_duration_minutes * 60)) >= ADDTIME(planned_time, SEC_TO_TIME(duration_minutes * 60)))
        );
    
    SELECT conflict_count as conflicts;
END //

DELIMITER ;

-- ================================================
-- TRIGGERS FOR AUTOMATION
-- ================================================

DELIMITER //

-- Trigger to update template usage count
CREATE TRIGGER update_template_usage 
    AFTER INSERT ON teacher_plans
    FOR EACH ROW
BEGIN
    IF NEW.template_id IS NOT NULL THEN
        UPDATE lesson_templates 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.template_id;
    END IF;
END //

-- Trigger to set completed_at timestamp
CREATE TRIGGER set_completed_timestamp
    BEFORE UPDATE ON teacher_plans
    FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SET NEW.completed_at = NOW();
    END IF;
END //

DELIMITER ;
