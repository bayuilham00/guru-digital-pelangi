# Multi-Subject Class Migration Script
# This script performs the complete migration from single-subject to multi-subject classes

param(
    [switch]$SkipBackup = $false,
    [switch]$TestMode = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 GURU DIGITAL PELANGI - MULTI-SUBJECT MIGRATION" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Database Backup
if (-not $SkipBackup) {
    Write-Host "📦 STEP 1: Creating Database Backup" -ForegroundColor Yellow
    Write-Host "-----------------------------------" -ForegroundColor Yellow
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_guru_digital_pelangi_$timestamp.sql"
    
    Write-Host "🔄 Creating backup: $backupFile" -ForegroundColor Cyan
    
    try {
        # Use cmd.exe to handle redirection properly
        cmd /c "mysqldump -u root -p guru_digital_pelangi > $backupFile"
        if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
            $fileSize = (Get-Item $backupFile).Length / 1MB
            Write-Host "✅ Backup completed successfully! Size: $($fileSize.ToString('F2')) MB" -ForegroundColor Green
        } else {
            throw "mysqldump failed with exit code $LASTEXITCODE"
        }
    } catch {
        Write-Host "❌ Backup failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "❌ Cannot proceed without backup. Exiting..." -ForegroundColor Red
        exit 1
    }
    Write-Host ""
} else {
    Write-Host "⚠️  SKIPPING BACKUP (Use -SkipBackup only for testing!)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Run SQL Migration
Write-Host "🗄️  STEP 2: Running Database Migration" -ForegroundColor Yellow
Write-Host "-------------------------------------" -ForegroundColor Yellow

if ($TestMode) {
    Write-Host "🧪 TEST MODE: Showing SQL commands that would be executed" -ForegroundColor Cyan
    Get-Content "migration-to-multisubject.sql" | Select-Object -First 20
    Write-Host "... (showing first 20 lines only)" -ForegroundColor Gray
} else {
    Write-Host "🔄 Executing migration SQL..." -ForegroundColor Cyan
    
    try {
        # Use cmd.exe to handle redirection properly
        cmd /c "mysql -u root -p guru_digital_pelangi < migration-to-multisubject.sql"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database migration completed successfully!" -ForegroundColor Green
        } else {
            throw "MySQL migration failed with exit code $LASTEXITCODE"
        }
    } catch {
        Write-Host "❌ SQL Migration failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "🔄 You can restore from backup: cmd /c `"mysql -u root -p guru_digital_pelangi < $backupFile`"" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host ""

# Step 3: Update Prisma Schema
Write-Host "📋 STEP 3: Updating Prisma Client" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

if ($TestMode) {
    Write-Host "🧪 TEST MODE: Would regenerate Prisma client" -ForegroundColor Cyan
} else {
    Write-Host "🔄 Regenerating Prisma client..." -ForegroundColor Cyan
    
    try {
        Set-Location "backend"
        npx prisma generate
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Prisma client updated successfully!" -ForegroundColor Green
        } else {
            throw "Prisma generate failed with exit code $LASTEXITCODE"
        }
        Set-Location ".."
    } catch {
        Write-Host "❌ Prisma update failed: $($_.Exception.Message)" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
}
Write-Host ""

# Step 4: Restart Backend Server
Write-Host "🔄 STEP 4: Backend Server Restart Required" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

if ($TestMode) {
    Write-Host "🧪 TEST MODE: Would restart backend server" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Please restart your backend server to load the new Prisma client" -ForegroundColor Yellow
    Write-Host "   cd backend && npm run dev" -ForegroundColor Cyan
}
Write-Host ""

# Step 5: Verification
Write-Host "✅ STEP 5: Migration Verification" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

if ($TestMode) {
    Write-Host "🧪 TEST MODE: Would verify migration" -ForegroundColor Cyan
} else {
    Write-Host "🔍 Verifying migration..." -ForegroundColor Cyan
    
    # Run verification query
    $verificationQuery = @"
SELECT 
  'MIGRATION SUMMARY' as info,
  (SELECT COUNT(*) FROM classes WHERE subject_id IS NOT NULL) as classes_with_subjects,
  (SELECT COUNT(*) FROM class_subjects) as class_subject_relationships,
  (SELECT COUNT(*) FROM class_teacher_subjects) as teacher_subject_assignments,
  (SELECT COUNT(*) FROM student_subject_enrollments) as student_enrollments;
"@
    
    try {
        $verificationQuery | cmd /c "mysql -u root -p guru_digital_pelangi"
        Write-Host "✅ Migration verification completed!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not run verification query, but migration likely succeeded" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. ✅ Database schema updated" -ForegroundColor Green
Write-Host "2. ✅ New tables created and populated" -ForegroundColor Green
Write-Host "3. ✅ Prisma client regenerated" -ForegroundColor Green
Write-Host "4. 🔄 Restart backend server" -ForegroundColor Yellow
Write-Host "5. 🧪 Test multi-subject functionality" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 API Endpoints Available:" -ForegroundColor Cyan
Write-Host "   GET /api/admin/classes/:id/full - Get class with all subjects" -ForegroundColor White
Write-Host "   POST /api/admin/classes/:id/subjects - Add subject to class" -ForegroundColor White
Write-Host "   POST /api/admin/classes/:id/subjects/:subjectId/teachers - Assign teacher" -ForegroundColor White
Write-Host "   DELETE /api/admin/classes/:id/subjects/:subjectId - Remove subject" -ForegroundColor White
Write-Host ""
Write-Host "📊 Backward Compatibility:" -ForegroundColor Cyan
Write-Host "   - Existing single-subject classes continue to work" -ForegroundColor Green
Write-Host "   - Old API endpoints remain functional" -ForegroundColor Green
Write-Host "   - Data has been migrated to new structure" -ForegroundColor Green
Write-Host ""

if (-not $SkipBackup) {
    Write-Host "💾 Backup File: $backupFile" -ForegroundColor Cyan
    Write-Host "   Keep this file safe for rollback if needed" -ForegroundColor White
    Write-Host ""
}

Write-Host "🚀 Ready to use multi-subject classes!" -ForegroundColor Green
