-- Guru Digital Pelangi - Database Setup Script
-- Run this script in your PostgreSQL database

-- Create Schools table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    school_id UUID REFERENCES schools(id),
    teacher_id UUID REFERENCES directus_users(id),
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024/2025',
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(20) NOT NULL UNIQUE, -- NISN
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    class_id UUID REFERENCES classes(id),
    date_of_birth DATE,
    gender VARCHAR(1) CHECK (gender IN ('L', 'P')),
    address TEXT,
    phone VARCHAR(50),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Grades table
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    subject_id UUID REFERENCES subjects(id),
    class_id UUID REFERENCES classes(id),
    grade_type VARCHAR(50) CHECK (grade_type IN ('tugas', 'quiz', 'ujian', 'praktik')),
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_by UUID REFERENCES directus_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Student XP table
CREATE TABLE IF NOT EXISTS student_xp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) UNIQUE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    level_name VARCHAR(50) CHECK (level_name IN ('Pemula', 'Pelajar', 'Cendekiawan', 'Ahli', 'Master')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    criteria TEXT,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Student Badges table
CREATE TABLE IF NOT EXISTS student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    badge_id UUID REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Learning Plans table (RPP)
CREATE TABLE IF NOT EXISTS learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    objectives JSONB,
    materials JSONB,
    methods JSONB,
    activities JSONB,
    assessments JSONB,
    duration INTEGER, -- in minutes
    date DATE NOT NULL,
    created_by UUID REFERENCES directus_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Question Categories table
CREATE TABLE IF NOT EXISTS question_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES subjects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) CHECK (question_type IN ('multiple_choice', 'multiple_choice_complex', 'true_false', 'fill_blank', 'essay')),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    subject_id UUID REFERENCES subjects(id),
    category_id UUID REFERENCES question_categories(id),
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    tags JSONB,
    created_by UUID REFERENCES directus_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Question Options table
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id),
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) CHECK (type IN ('grade', 'xp', 'badge', 'question', 'exercise')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES directus_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add NIP field to directus_users table
ALTER TABLE directus_users ADD COLUMN IF NOT EXISTS nip VARCHAR(20) UNIQUE;
ALTER TABLE directus_users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'guru' CHECK (role IN ('admin', 'guru'));

-- Insert sample data
INSERT INTO schools (name, address, phone, email) VALUES 
('SMA Digital Pelangi', 'Jl. Pendidikan No. 123, Jakarta', '021-12345678', 'info@smadigitalpelangi.sch.id')
ON CONFLICT DO NOTHING;

INSERT INTO subjects (name, code, description) VALUES 
('Matematika', 'MTK', 'Mata pelajaran Matematika'),
('Bahasa Indonesia', 'BIN', 'Mata pelajaran Bahasa Indonesia'),
('IPA', 'IPA', 'Ilmu Pengetahuan Alam'),
('IPS', 'IPS', 'Ilmu Pengetahuan Sosial'),
('Bahasa Inggris', 'ENG', 'Mata pelajaran Bahasa Inggris')
ON CONFLICT (code) DO NOTHING;

INSERT INTO badges (name, description, icon, criteria, xp_reward) VALUES 
('Perfect Attendance', 'Hadir sempurna selama 1 bulan', '🎯', 'Tidak absen selama 30 hari berturut-turut', 100),
('Quiz Master', 'Menyelesaikan 10 quiz dengan nilai sempurna', '🧠', 'Mendapat nilai 100 pada 10 quiz berbeda', 150),
('Helper', 'Membantu teman sekelas', '🤝', 'Membantu teman dalam pembelajaran', 50),
('Early Bird', 'Selalu datang tepat waktu', '⏰', 'Tidak pernah terlambat dalam 1 bulan', 75)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_date ON grades(date);
CREATE INDEX IF NOT EXISTS idx_student_xp_student_id ON student_xp(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_xp_updated_at BEFORE UPDATE ON student_xp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_plans_updated_at BEFORE UPDATE ON learning_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_categories_updated_at BEFORE UPDATE ON question_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_options_updated_at BEFORE UPDATE ON question_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
