# Directus Collections Setup Guide

## 1. Start Directus

```bash
cd backend
docker-compose up -d
```

Access Directus at: http://localhost:8055
Login: admin@pelangi.sch.id / admin123

## 2. Create Collections

### Core Collections

#### 1. Schools
- **Collection Name**: `schools`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String, Required)
  - `address` (Text)
  - `phone` (String)
  - `email` (String)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### 2. Subjects
- **Collection Name**: `subjects`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String, Required)
  - `code` (String, Required, Unique)
  - `description` (Text)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### 3. Classes
- **Collection Name**: `classes`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String, Required)
  - `grade_level` (String, Required)
  - `school_id` (UUID, M2O → schools)
  - `teacher_id` (UUID, M2O → directus_users)
  - `academic_year` (String, Required)
  - `student_count` (Integer, Default: 0)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### 4. Students
- **Collection Name**: `students`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `student_id` (String, Required, Unique) // NIS/NISN
  - `first_name` (String, Required)
  - `last_name` (String, Required)
  - `email` (String)
  - `class_id` (UUID, M2O → classes)
  - `date_of_birth` (Date)
  - `gender` (String, Options: L, P)
  - `address` (Text)
  - `phone` (String)
  - `parent_name` (String)
  - `parent_phone` (String)
  - `status` (String, Options: active, inactive, graduated, Default: active)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### Academic Collections

#### 5. Grades
- **Collection Name**: `grades`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `student_id` (UUID, M2O → students)
  - `subject_id` (UUID, M2O → subjects)
  - `class_id` (UUID, M2O → classes)
  - `grade_type` (String, Options: tugas, quiz, ujian, praktik)
  - `score` (Float, Required)
  - `max_score` (Float, Required)
  - `description` (Text)
  - `date` (Date, Required)
  - `created_by` (UUID, M2O → directus_users)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### 6. Learning Plans (RPP)
- **Collection Name**: `learning_plans`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `title` (String, Required)
  - `class_id` (UUID, M2O → classes)
  - `subject_id` (UUID, M2O → subjects)
  - `objectives` (JSON)
  - `materials` (JSON)
  - `methods` (JSON)
  - `activities` (JSON)
  - `assessments` (JSON)
  - `duration` (Integer) // in minutes
  - `date` (Date, Required)
  - `created_by` (UUID, M2O → directus_users)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### Question Bank Collections

#### 7. Question Categories
- **Collection Name**: `question_categories`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String, Required)
  - `description` (Text)
  - `subject_id` (UUID, M2O → subjects)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### 8. Questions
- **Collection Name**: `questions`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `question_text` (Text, Required)
  - `question_type` (String, Options: multiple_choice, essay, true_false, fill_blank)
  - `difficulty` (String, Options: easy, medium, hard)
  - `subject_id` (UUID, M2O → subjects)
  - `category_id` (UUID, M2O → question_categories)
  - `correct_answer` (Text, Required)
  - `explanation` (Text)
  - `tags` (JSON)
  - `created_by` (UUID, M2O → directus_users)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### 9. Question Options
- **Collection Name**: `question_options`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `question_id` (UUID, M2O → questions)
  - `option_text` (Text, Required)
  - `is_correct` (Boolean, Default: false)
  - `order_index` (Integer)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### Gamification Collections

#### 10. Student XP
- **Collection Name**: `student_xp`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `student_id` (UUID, M2O → students, Unique)
  - `total_xp` (Integer, Default: 0)
  - `level` (Integer, Default: 1)
  - `level_name` (String, Options: Pemula, Pelajar, Cendekiawan, Ahli, Master)
  - `updated_at` (DateTime, Auto)

#### 11. Badges
- **Collection Name**: `badges`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String, Required)
  - `description` (Text)
  - `icon` (String)
  - `criteria` (Text)
  - `xp_reward` (Integer, Default: 0)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### 12. Student Badges
- **Collection Name**: `student_badges`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `student_id` (UUID, M2O → students)
  - `badge_id` (UUID, M2O → badges)
  - `earned_at` (DateTime, Auto)

#### 13. Activities
- **Collection Name**: `activities`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `type` (String, Options: grade, xp, badge, question, exercise)
  - `title` (String, Required)
  - `description` (Text)
  - `user_id` (UUID, M2O → directus_users)
  - `created_at` (DateTime, Auto)

## 3. Setup Permissions

### Admin Role
- Full access to all collections

### Guru Role
- Read/Write: classes, students, grades, learning_plans, questions, question_options, activities
- Read only: subjects, question_categories, badges
- No access: schools, directus_users

### Siswa Role
- Read only: Own student record, own grades, own XP data, badges, leaderboard
- No write access to any collection

## 4. Sample Data

After creating collections, add sample data:

### Sample School
```json
{
  "name": "SMA Digital Pelangi",
  "address": "Jl. Pendidikan No. 123, Jakarta",
  "phone": "021-12345678",
  "email": "info@smadigitalpelangi.sch.id"
}
```

### Sample Subject
```json
{
  "name": "Matematika",
  "code": "MTK",
  "description": "Mata pelajaran Matematika"
}
```

### Sample Class
```json
{
  "name": "X-1",
  "grade_level": "10",
  "academic_year": "2024/2025",
  "student_count": 30
}
```

## 5. Environment Variables

Update your `.env` file:
```
VITE_DIRECTUS_URL=http://localhost:8055
```
