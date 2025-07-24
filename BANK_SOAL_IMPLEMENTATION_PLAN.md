# Bank Soal Module - Implementation Plan

## Overview
Bank Soal adalah modul kedua dari 4 modul baru yang akan dikembangkan. Module ini menyediakan fitur lengkap untuk manajemen bank soal/kuis untuk guru.

## 🎯 Features to Implement

### 1. Core Features
- **Question Management**: CRUD operations untuk soal
- **Question Types**: Multiple choice, Essay, True/False, Fill in the blank
- **Question Categories**: Berdasarkan mata pelajaran dan topik
- **Difficulty Levels**: Easy, Medium, Hard
- **Question Bank**: Koleksi soal yang dapat diorganisir

### 2. Advanced Features
- **Question Import/Export**: Upload soal dari file Excel/CSV
- **Question Preview**: Preview soal sebelum digunakan
- **Question Statistics**: Analytics penggunaan soal
- **Question Sharing**: Berbagi soal antar guru
- **Question Templates**: Template soal untuk mempercepat pembuatan

### 3. Integration Features
- **Subject Integration**: Integrasi dengan master data mata pelajaran
- **Class Integration**: Assign soal ke kelas tertentu
- **Assignment Integration**: Gunakan soal untuk tugas/kuis
- **Gamification Integration**: Point system untuk soal yang dijawab

## 🗄️ Database Schema Design

### Question Model
```prisma
model Question {
  id              String        @id @default(cuid())
  title           String        @db.VarChar(255)
  content         String        @db.Text
  type            QuestionType  @default(MULTIPLE_CHOICE)
  difficulty      DifficultyLevel @default(MEDIUM)
  subjectId       String
  topicId         String?
  gradeLevel      String        @db.VarChar(10)
  options         Json?         // For multiple choice questions
  correctAnswer   String?       // For objective questions
  explanation     String?       @db.Text
  points          Int           @default(1)
  timeLimit       Int?          // In seconds
  tags            String[]      // For categorization
  isPublic        Boolean       @default(false)
  createdBy       String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Relations
  subject         Subject       @relation(fields: [subjectId], references: [id])
  topic           Topic?        @relation(fields: [topicId], references: [id])
  creator         User          @relation(fields: [createdBy], references: [id])
  questionBanks   QuestionBankItem[]
  assignments     AssignmentQuestion[]
  answers         StudentAnswer[]
}

enum QuestionType {
  MULTIPLE_CHOICE
  ESSAY
  TRUE_FALSE
  FILL_IN_BLANK
  MATCHING
}

enum DifficultyLevel {
  EASY
  MEDIUM
  HARD
}
```

### QuestionBank Model
```prisma
model QuestionBank {
  id          String    @id @default(cuid())
  name        String    @db.VarChar(255)
  description String?   @db.Text
  subjectId   String
  gradeLevel  String    @db.VarChar(10)
  isPublic    Boolean   @default(false)
  createdBy   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  subject     Subject   @relation(fields: [subjectId], references: [id])
  creator     User      @relation(fields: [createdBy], references: [id])
  questions   QuestionBankItem[]
}

model QuestionBankItem {
  id            String      @id @default(cuid())
  questionBankId String
  questionId    String
  order         Int         @default(0)
  createdAt     DateTime    @default(now())
  
  // Relations
  questionBank  QuestionBank @relation(fields: [questionBankId], references: [id])
  question      Question    @relation(fields: [questionId], references: [id])
  
  @@unique([questionBankId, questionId])
}
```

### Topic Model (Support)
```prisma
model Topic {
  id          String    @id @default(cuid())
  name        String    @db.VarChar(255)
  description String?   @db.Text
  subjectId   String
  gradeLevel  String    @db.VarChar(10)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  subject     Subject   @relation(fields: [subjectId], references: [id])
  questions   Question[]
}
```

## 🛠️ Implementation Steps

### Phase 1: Backend Setup (Day 1)
1. **Database Migration**: Create tables for questions, question banks, topics
2. **Prisma Schema**: Update schema with new models
3. **Controllers**: Create questionController.js and questionBankController.js
4. **Routes**: Setup API routes for questions and question banks
5. **Middleware**: Add validation middleware for question operations

### Phase 2: Core API Development (Day 2)
1. **Question CRUD**: Create, Read, Update, Delete operations
2. **Question Bank CRUD**: Manage question banks
3. **Question Search**: Search and filter questions
4. **Question Categories**: Topic and subject-based categorization
5. **Question Validation**: Input validation and error handling

### Phase 3: Frontend Development (Day 3)
1. **Service Layer**: Create questionService.ts
2. **Components**: Question list, question form, question preview
3. **Question Builder**: Interactive question builder UI
4. **Question Bank Manager**: Manage question banks
5. **Integration**: Connect with backend APIs

### Phase 4: Advanced Features (Day 4)
1. **Question Import**: Upload questions from Excel/CSV
2. **Question Export**: Export questions to various formats
3. **Question Statistics**: Usage analytics
4. **Question Sharing**: Share questions between teachers
5. **Question Templates**: Pre-built question templates

## 🎨 UI/UX Design

### Main Pages
1. **Question List**: Grid/list view of all questions
2. **Question Builder**: Form for creating/editing questions
3. **Question Bank Manager**: Organize questions into banks
4. **Question Preview**: Preview questions before use
5. **Question Statistics**: Analytics and usage stats

### Components
1. **QuestionCard**: Display question summary
2. **QuestionForm**: Create/edit question form
3. **QuestionPreview**: Preview question as students see it
4. **QuestionFilter**: Filter questions by various criteria
5. **QuestionBankSelector**: Select questions for a bank

## 📋 API Endpoints

### Questions
- `GET /api/bank-soal/questions` - Get all questions
- `POST /api/bank-soal/questions` - Create new question
- `GET /api/bank-soal/questions/:id` - Get specific question
- `PUT /api/bank-soal/questions/:id` - Update question
- `DELETE /api/bank-soal/questions/:id` - Delete question
- `GET /api/bank-soal/questions/search` - Search questions

### Question Banks
- `GET /api/bank-soal/banks` - Get all question banks
- `POST /api/bank-soal/banks` - Create new question bank
- `GET /api/bank-soal/banks/:id` - Get specific question bank
- `PUT /api/bank-soal/banks/:id` - Update question bank
- `DELETE /api/bank-soal/banks/:id` - Delete question bank
- `POST /api/bank-soal/banks/:id/questions` - Add question to bank

### Topics
- `GET /api/bank-soal/topics` - Get all topics
- `POST /api/bank-soal/topics` - Create new topic
- `PUT /api/bank-soal/topics/:id` - Update topic
- `DELETE /api/bank-soal/topics/:id` - Delete topic

## 🔄 Integration Points

### With Existing Modules
1. **Subject Integration**: Use existing subject data
2. **Class Integration**: Assign questions to classes
3. **User Integration**: Track question creators
4. **Assignment Integration**: Use questions in assignments

### With Future Modules
1. **RPP Integration**: Include questions in lesson plans
2. **Jurnal Integration**: Track question usage in teaching journal

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for controllers
- Integration tests for API endpoints
- Database operation tests
- Authentication/authorization tests

### Frontend Testing
- Component unit tests
- Integration tests for forms
- UI interaction tests
- API integration tests

## 📊 Success Metrics

### Functional Metrics
- Questions created per teacher
- Question banks created
- Questions reused across assignments
- Question accuracy rates

### Technical Metrics
- API response times
- Database query performance
- Frontend rendering performance
- Error rates

## 🚀 Next Steps
1. Start with database schema implementation
2. Create basic CRUD operations
3. Implement question builder UI
4. Add advanced features incrementally
5. Integrate with existing modules

Ready to begin Bank Soal module implementation!
