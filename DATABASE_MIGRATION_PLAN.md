# Database Migration Plan: Single-Subject to Multi-Subject Classes

## Overview
Migrating from single-subject classes to multi-subject classes with proper teacher assignments.

## Current Schema Issues
- Classes are tied to single subjects via `subjectId` field
- Teachers are assigned to classes via `ClassTeacher` junction table (no subject specificity)
- No support for multiple subjects per class

## New Schema Benefits
- Classes can have multiple subjects
- Teachers are assigned to specific class-subject combinations
- Students can be enrolled in specific class-subject combinations
- Backward compatibility maintained during transition

## Migration Strategy
**Soft Migration with Backward Compatibility**
- Keep existing `subjectId` field as deprecated but functional
- Add new junction tables for multi-subject support
- Migrate existing data to new structure
- Update APIs to use new schema while maintaining backward compatibility
- Phase out old fields after full migration

## Step-by-Step Implementation

### Phase 1: Database Schema Migration
1. **Backup Current Database**
2. **Add New Tables:**
   - `class_subjects` (ClassSubject)
   - `class_teacher_subjects` (ClassTeacherSubject) 
   - `student_subject_enrollments` (StudentSubjectEnrollment)
3. **Migrate Existing Data:**
   - Convert current Class-Subject relationships to ClassSubject entries
   - Convert current ClassTeacher assignments to ClassTeacherSubject entries
   - Create StudentSubjectEnrollment entries for existing class-student relationships

### Phase 2: API Updates
1. **Update Multi-Subject Routes** to use new schema
2. **Create Migration-Aware Services** that work with both old and new schema
3. **Update Authentication and Middleware**

### Phase 3: Frontend Updates
1. **Update ClassManager** to use new multi-subject APIs effectively
2. **Enhance Subject Management UI**
3. **Update Student Enrollment Interfaces**

### Phase 4: Testing and Cleanup
1. **Comprehensive Testing** of all new functionality
2. **Data Validation** to ensure migration accuracy
3. **Performance Optimization**
4. **Documentation Updates**

## Timeline
- **Phase 1:** Database Migration (30 minutes)
- **Phase 2:** API Updates (45 minutes)  
- **Phase 3:** Frontend Updates (30 minutes)
- **Phase 4:** Testing & Cleanup (15 minutes)

**Total Estimated Time:** 2 hours

## Rollback Plan
- Database backup for instant rollback
- Git version control for code rollback
- Backward compatibility maintained throughout

## Success Criteria
- ✅ All existing classes work normally
- ✅ New multi-subject functionality works
- ✅ Teachers can be assigned to specific class-subject combinations
- ✅ Students can be enrolled in multiple subjects per class
- ✅ No data loss during migration
- ✅ Performance maintained or improved

Let's begin the implementation!
