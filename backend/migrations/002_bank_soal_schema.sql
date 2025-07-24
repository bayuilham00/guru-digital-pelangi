-- Bank Soal Module Database Schema Migration
-- This migration creates tables for question management system

-- Create Topics table for organizing questions by subject topics
CREATE TABLE topics (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id VARCHAR(50) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_topics_subject_grade (subject_id, grade_level)
);

-- Create Questions table for storing all questions
CREATE TABLE questions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('MULTIPLE_CHOICE', 'ESSAY', 'TRUE_FALSE', 'FILL_IN_BLANK', 'MATCHING') DEFAULT 'MULTIPLE_CHOICE',
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
    subject_id VARCHAR(50) NOT NULL,
    topic_id VARCHAR(50) NULL,
    grade_level VARCHAR(10) NOT NULL,
    options JSON NULL, -- For multiple choice questions
    correct_answer TEXT NULL, -- For objective questions
    explanation TEXT NULL,
    points INT DEFAULT 1,
    time_limit INT NULL, -- In seconds
    tags JSON NULL, -- Array of tags for categorization
    is_public BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_questions_subject_grade (subject_id, grade_level),
    INDEX idx_questions_topic (topic_id),
    INDEX idx_questions_type (type),
    INDEX idx_questions_difficulty (difficulty),
    INDEX idx_questions_creator (created_by),
    INDEX idx_questions_public (is_public)
);

-- Create Question Banks table for organizing questions into collections
CREATE TABLE question_banks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id VARCHAR(50) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_question_banks_subject_grade (subject_id, grade_level),
    INDEX idx_question_banks_creator (created_by),
    INDEX idx_question_banks_public (is_public)
);

-- Create Question Bank Items table for many-to-many relationship between banks and questions
CREATE TABLE question_bank_items (
    id VARCHAR(50) PRIMARY KEY,
    question_bank_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (question_bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_bank_question (question_bank_id, question_id),
    INDEX idx_question_bank_items_bank (question_bank_id),
    INDEX idx_question_bank_items_question (question_id),
    INDEX idx_question_bank_items_order (order_index)
);

-- Create Student Answers table for tracking student responses (for analytics)
CREATE TABLE student_answers (
    id VARCHAR(50) PRIMARY KEY,
    question_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    assignment_id VARCHAR(50) NULL, -- Link to specific assignment if applicable
    answer_text TEXT,
    is_correct BOOLEAN NULL, -- NULL for subjective questions
    score INT NULL,
    time_taken INT NULL, -- In seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    
    INDEX idx_student_answers_question (question_id),
    INDEX idx_student_answers_student (student_id),
    INDEX idx_student_answers_assignment (assignment_id),
    INDEX idx_student_answers_created (created_at)
);

-- Create Assignment Questions table for linking questions to assignments
CREATE TABLE assignment_questions (
    id VARCHAR(50) PRIMARY KEY,
    assignment_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    order_index INT DEFAULT 0,
    points_override INT NULL, -- Override question's default points
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_assignment_question (assignment_id, question_id),
    INDEX idx_assignment_questions_assignment (assignment_id),
    INDEX idx_assignment_questions_question (question_id),
    INDEX idx_assignment_questions_order (order_index)
);

-- Insert sample topics for testing
INSERT INTO topics (id, name, description, subject_id, grade_level) VALUES
('topic_mtk_aljabar_10', 'Aljabar Dasar', 'Konsep dasar aljabar dan persamaan linear', 'cmcjghq610001u82sv87ny8sc', '10'),
('topic_mtk_geometri_10', 'Geometri', 'Bangun datar dan bangun ruang', 'cmcjghq610001u82sv87ny8sc', '10'),
('topic_mtk_trigonometri_11', 'Trigonometri', 'Fungsi trigonometri dan aplikasinya', 'cmcjghq610001u82sv87ny8sc', '11'),
('topic_fis_mekanika_10', 'Mekanika', 'Gerak dan gaya dalam fisika', 'cmcjghrm70004u82sc71uhdvn', '10'),
('topic_fis_termodinamika_11', 'Termodinamika', 'Konsep panas dan energi', 'cmcjghrm70004u82sc71uhdvn', '11'),
('topic_kim_atomik_10', 'Struktur Atom', 'Model atom dan konfigurasi elektron', 'cmcjghrwe0005u82se4yuldvn', '10'),
('topic_bio_sel_10', 'Biologi Sel', 'Struktur dan fungsi sel', 'cmcjghs6z0006u82sv2xhvyvn', '10'),
('topic_bin_teks_10', 'Teks Narasi', 'Struktur dan ciri-ciri teks narasi', 'cmcjghr2c0002u82s73rad8w2', '10'),
('topic_eng_grammar_10', 'Grammar Basics', 'Tata bahasa dasar bahasa Inggris', 'cmcjghrax0003u82s2jyp1foi', '10'),
('topic_sej_indonesia_10', 'Sejarah Indonesia', 'Perkembangan sejarah Indonesia', 'cmcjghshm0007u82scx9dlnxj', '10');

-- Insert sample questions for testing
INSERT INTO questions (id, title, content, type, difficulty, subject_id, topic_id, grade_level, options, correct_answer, explanation, points, created_by) VALUES
('q_mtk_aljabar_001', 'Persamaan Linear Sederhana', 'Tentukan nilai x dari persamaan: 2x + 5 = 13', 'MULTIPLE_CHOICE', 'EASY', 'cmcjghq610001u82sv87ny8sc', 'topic_mtk_aljabar_10', '10', '["4", "3", "5", "6"]', '0', 'Langkah penyelesaian: 2x + 5 = 13, maka 2x = 13 - 5 = 8, sehingga x = 4', 2, 'cmcjghpl50000u82soo8yl0tz'),
('q_mtk_aljabar_002', 'Operasi Aljabar', 'Sederhanakan bentuk aljabar: 3x + 2y - x + 4y', 'MULTIPLE_CHOICE', 'MEDIUM', 'cmcjghq610001u82sv87ny8sc', 'topic_mtk_aljabar_10', '10', '["2x + 6y", "4x + 2y", "3x + 6y", "2x + 2y"]', '0', 'Mengumpulkan suku sejenis: 3x - x + 2y + 4y = 2x + 6y', 3, 'cmcjghpl50000u82soo8yl0tz'),
('q_fis_mekanika_001', 'Hukum Newton I', 'Jelaskan bunyi Hukum Newton I dan berikan contohnya dalam kehidupan sehari-hari!', 'ESSAY', 'MEDIUM', 'cmcjghrm70004u82sc71uhdvn', 'topic_fis_mekanika_10', '10', NULL, NULL, 'Hukum Newton I menyatakan bahwa benda akan tetap diam atau bergerak lurus beraturan jika tidak ada gaya yang bekerja padanya. Contoh: buku di atas meja akan tetap diam sampai ada yang memindahkannya.', 5, 'cmcjghpl50000u82soo8yl0tz'),
('q_kim_atomik_001', 'Konfigurasi Elektron', 'Konfigurasi elektron atom Natrium (Na, Z=11) adalah...', 'MULTIPLE_CHOICE', 'MEDIUM', 'cmcjghrwe0005u82se4yuldvn', 'topic_kim_atomik_10', '10', '["1s² 2s² 2p⁶ 3s¹", "1s² 2s² 2p⁶ 3p¹", "1s² 2s² 2p⁵ 3s²", "1s² 2s² 2p⁶ 3d¹"]', '0', 'Natrium memiliki 11 elektron: 1s² 2s² 2p⁶ 3s¹', 3, 'cmcjghpl50000u82soo8yl0tz'),
('q_bio_sel_001', 'Organel Sel', 'Benar atau salah: Mitokondria adalah organel yang berperan dalam respirasi seluler.', 'TRUE_FALSE', 'EASY', 'cmcjghs6z0006u82sv2xhvyvn', 'topic_bio_sel_10', '10', '["Benar", "Salah"]', '0', 'Mitokondria adalah organel yang berperan dalam respirasi seluler untuk menghasilkan ATP.', 2, 'cmcjghpl50000u82soo8yl0tz');

-- Insert sample question banks for testing
INSERT INTO question_banks (id, name, description, subject_id, grade_level, created_by) VALUES
('qb_mtk_aljabar_basic', 'Aljabar Dasar - Latihan', 'Kumpulan soal aljabar dasar untuk kelas 10', 'cmcjghq610001u82sv87ny8sc', '10', 'cmcjghpl50000u82soo8yl0tz'),
('qb_fis_mekanika_basic', 'Mekanika - Konsep Dasar', 'Soal-soal mekanika untuk pemahaman konsep dasar', 'cmcjghrm70004u82sc71uhdvn', '10', 'cmcjghpl50000u82soo8yl0tz'),
('qb_kimia_atom_basic', 'Struktur Atom - Latihan', 'Soal-soal struktur atom dan konfigurasi elektron', 'cmcjghrwe0005u82se4yuldvn', '10', 'cmcjghpl50000u82soo8yl0tz');

-- Insert sample question bank items
INSERT INTO question_bank_items (id, question_bank_id, question_id, order_index) VALUES
('qbi_001', 'qb_mtk_aljabar_basic', 'q_mtk_aljabar_001', 1),
('qbi_002', 'qb_mtk_aljabar_basic', 'q_mtk_aljabar_002', 2),
('qbi_003', 'qb_fis_mekanika_basic', 'q_fis_mekanika_001', 1),
('qbi_004', 'qb_kimia_atom_basic', 'q_kim_atomik_001', 1),
('qbi_005', 'qb_kimia_atom_basic', 'q_bio_sel_001', 2);
