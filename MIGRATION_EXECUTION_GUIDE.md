# EXECUTION GUIDE: Multi-Subject Database Migration

## Ready to Execute? ✅

All files have been prepared for the migration to multi-subject classes. Here's your step-by-step execution plan:

---

## 🎯 **STEP-BY-STEP EXECUTION**

### **Phase 1: Pre-Migration Backup (CRITICAL!)**

```powershell
# 1. Navigate to project directory
cd "d:\CascadeProjects\guru-digital-pelangi"

# 2. Create database backup (MANDATORY!)
./backup-database.ps1
```

**⚠️ DO NOT PROCEED WITHOUT BACKUP! ⚠️**

---

### **Phase 2: Execute Migration Script**

```powershell
# Run the complete migration
./run-migration.ps1

# OR for testing first:
./run-migration.ps1 -TestMode

# OR if you want to skip backup (NOT RECOMMENDED):
./run-migration.ps1 -SkipBackup
```

This script will:
- ✅ Create database backup
- ✅ Execute SQL migration (add new tables + migrate data)
- ✅ Update Prisma client
- ✅ Verify migration success

---

### **Phase 3: Restart Backend Server**

```powershell
# Stop current backend server (Ctrl+C if running)
# Then restart:
cd backend
npm run dev
```

---

### **Phase 4: Test Multi-Subject Functionality**

1. **Open ClassManager in frontend**
2. **Click "Subjects" button on any class** - should work without 403/500 errors
3. **Test adding new subjects to classes**
4. **Test assigning teachers to specific subjects**
5. **Verify all existing data still works**

---

## 🛡️ **SAFETY FEATURES BUILT-IN**

- **✅ Backward Compatibility**: Existing single-subject classes continue to work
- **✅ Data Migration**: All current data automatically moved to new structure
- **✅ Rollback Ready**: Database backup created for instant rollback if needed
- **✅ Dual Schema Support**: APIs work with both old and new data structures

---

## 📊 **WHAT THE MIGRATION DOES**

### **New Tables Created:**
- `class_subjects` - Junction table for class ↔ multiple subjects
- `class_teacher_subjects` - Teachers assigned to specific class-subject combinations  
- `student_subject_enrollments` - Students enrolled in specific class-subject combinations

### **Data Migration:**
- **Classes with subjects** → Create `ClassSubject` entries
- **Teacher assignments** → Convert `ClassTeacher` to `ClassTeacherSubject` entries
- **Student enrollments** → Create `StudentSubjectEnrollment` for all current students

### **Schema Updates:**
- **Class model**: Added `isPhysicalClass` field + new relations
- **Subject model**: Added multi-subject relations
- **User model**: Added `ClassTeacherSubject` relation
- **Student model**: Added `StudentSubjectEnrollment` relation

---

## 🔧 **API ENDPOINTS NOW AVAILABLE**

After migration, these endpoints will work with the new schema:

```
GET    /api/admin/classes/:id/full                          # Get class with all subjects
POST   /api/admin/classes/:id/subjects                      # Add subject to class  
POST   /api/admin/classes/:id/subjects/:subjectId/teachers  # Assign teacher to subject
DELETE /api/admin/classes/:id/subjects/:subjectId           # Remove subject from class
```

---

## 🚨 **IF SOMETHING GOES WRONG**

### **Quick Rollback:**
```powershell
# Restore from backup (replace with your backup filename)
mysql -u root -p guru_digital_pelangi < backup_guru_digital_pelangi_YYYYMMDD_HHMMSS.sql

# Revert Prisma schema changes
git checkout backend/prisma/schema.prisma

# Regenerate old Prisma client
cd backend
npx prisma generate
```

### **Common Issues & Solutions:**

**"Access denied" errors:**
- Make sure MySQL is running and credentials are correct
- Run PowerShell as Administrator if needed

**"Prisma generate failed":**
- Check for syntax errors in schema.prisma
- Restart VS Code and try again

**"Frontend still shows errors":**
- Clear browser cache
- Restart frontend dev server
- Check browser console for details

---

## 🎉 **SUCCESS INDICATORS**

You'll know the migration succeeded when:

✅ Migration script shows "MIGRATION COMPLETED SUCCESSFULLY!"  
✅ No errors in backend server console  
✅ ClassManager "Subjects" button opens modal successfully  
✅ Can add new subjects to classes  
✅ Can assign teachers to specific subjects  
✅ All existing classes still display correctly  

---

## 🚀 **READY TO EXECUTE?**

Type this command when you're ready:

```powershell
./run-migration.ps1
```

**The migration should take about 2-5 minutes to complete.**

Good luck! 🍀
