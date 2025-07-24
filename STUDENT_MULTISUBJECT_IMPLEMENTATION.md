# Student Multi-Subject Class Management Implementation

## 📋 **TASK LIST - PHASE 1: Database Schema Update**

### **Task 1.1: Schema Preparation** ✅ **COMPLETED**
- [x] Add new models to schema.prisma
- [x] Make Class.subjectId nullable for backward compatibility
- [x] Add approval system fields
- [x] Validate schema syntax

**New Models Added:**
- `ClassSubject` - Junction table for class-subject relationships
- `ClassTeacherSubject` - Teacher assignments to specific class-subject combinations
- `StudentSubjectEnrollment` - Track student enrollment in class-subject combinations
- `EnrollmentApproval` - Approval system for enrollments and transfers
- `StudentTransferHistory` - Audit trail for student transfers
- `EnrollmentRequestType` and `ApprovalStatus` enums

**Model Updates:**
- `Class` - Added `isPhysicalClass` field and new relations
- `Subject` - Added relations to new junction tables
- `User` - Added relations for approval system and class-teacher-subject assignments
- `Student` - Added relations for subject enrollments and transfer history

### **Task 1.2: Migration Files** ⏳
- [ ] Create migration for new tables
- [ ] Create data migration script for existing data
- [ ] Create rollback migration (safety)

### **Task 1.3: Schema Deployment**
- [ ] Test migration on development database
- [ ] Apply migration to development
- [ ] Verify data integrity

---

## 📋 **TASK LIST - PHASE 2: Data Migration & API Updates**

### **Task 2.1: Data Migration Scripts**
- [ ] Convert existing Class data to ClassSubject
- [ ] Convert existing ClassTeacher to ClassTeacherSubject  
- [ ] Auto-create StudentSubjectEnrollment for existing students
- [ ] Verify migration results

### **Task 2.2: Core API Updates**
- [ ] Update Class service/controller
- [ ] Update Student enrollment service/controller
- [ ] Update Teacher assignment service/controller
- [ ] Add approval system APIs

### **Task 2.3: Student Transfer System**
- [ ] Create student transfer API
- [ ] Add transfer approval workflow
- [ ] Create transfer history tracking

---

## 📋 **TASK LIST - PHASE 3: Frontend Updates**

### **Task 3.1: Class Management UI**
- [ ] Update class creation form (physical class concept)
- [ ] Add subject assignment to class UI
- [ ] Update class listing with multi-subject view

### **Task 3.2: Student Management UI**
- [ ] Update student enrollment UI
- [ ] Add student transfer UI
- [ ] Add approval system UI for enrollment/transfer

### **Task 3.3: Teacher Dashboard Updates**
- [ ] Update teacher class-subject assignment UI
- [ ] Update student listing per class-subject
- [ ] Update grade management for multi-subject

---

## 📋 **TASK LIST - PHASE 4: Testing & Polish**

### **Task 4.1: Integration Testing**
- [ ] Test complete enrollment workflow
- [ ] Test student transfer workflow
- [ ] Test approval system workflow

### **Task 4.2: UI/UX Polish**
- [ ] Add loading states and error handling
- [ ] Add confirmation dialogs for critical actions
- [ ] Add bulk operations where needed

### **Task 4.3: Documentation**
- [ ] Update API documentation
- [ ] Create user guide for new features
- [ ] Create migration guide

---

## 🚀 **CURRENT STATUS**

**Phase 1 - Task 1.1: Schema Preparation** ⏳ **IN PROGRESS**

Starting with schema updates...
