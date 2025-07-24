# Database Backup Script
# Run this before starting migration

# PowerShell version
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_guru_digital_pelangi_$timestamp.sql"

Write-Host "🔄 Creating database backup..." -ForegroundColor Yellow
Write-Host "📁 Backup file: $backupFile" -ForegroundColor Cyan

# Using mysqldump (adjust connection parameters as needed)
cmd /c "mysqldump -u root -p guru_digital_pelangi > $backupFile"

if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
    Write-Host "✅ Database backup completed successfully!" -ForegroundColor Green
    Write-Host "📁 Backup saved as: $backupFile" -ForegroundColor Green
    Write-Host "📊 File size: $((Get-Item $backupFile).Length / 1MB) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Database backup failed!" -ForegroundColor Red
    Write-Host "Please check your MySQL connection and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔐 To restore from backup if needed:" -ForegroundColor Yellow
Write-Host "cmd /c `"mysql -u root -p guru_digital_pelangi < $backupFile`"" -ForegroundColor Cyan
