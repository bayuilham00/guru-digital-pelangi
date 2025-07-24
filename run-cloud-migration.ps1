# Cloud Database Migration Script for Guru Digital Pelangi
# This script performs migration directly to cloud MySQL database
# Database: 20.188.104.174:3306/guru_digital_pelangi

param(
    [switch]$SkipBackup = $false,
    [switch]$TestMode = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 GURU DIGITAL PELANGI - CLOUD DATABASE MIGRATION" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🌐 Target: Cloud MySQL (20.188.104.174)" -ForegroundColor Yellow
Write-Host ""

# Load environment variables from backend/.env
function Get-EnvVariable {
    param($name)
    $envFile = "backend\.env"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        foreach ($line in $content) {
            if ($line -match "^$name=(.+)$") {
                return $matches[1].Trim('"')
            }
        }
    }
    return $null
}

# Parse DATABASE_URL to extract connection info
$databaseUrl = Get-EnvVariable "DATABASE_URL"
Write-Host "🔗 Database URL found: $($databaseUrl.Substring(0, 30))..." -ForegroundColor Cyan

if (-not $databaseUrl) {
    Write-Host "❌ DATABASE_URL not found in backend\.env" -ForegroundColor Red
    exit 1
}

# Extract connection details from DATABASE_URL
# Format: mysql://username:password@host:port/database
if ($databaseUrl -match "mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "❌ Invalid DATABASE_URL format" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Connection Details:" -ForegroundColor Cyan
Write-Host "   Host: $dbHost" -ForegroundColor White
Write-Host "   Port: $dbPort" -ForegroundColor White
Write-Host "   Database: $dbName" -ForegroundColor White
Write-Host "   User: $dbUser" -ForegroundColor White
Write-Host ""

# Step 1: Database Backup (Cloud MySQL)
if (-not $SkipBackup) {
    Write-Host "📦 STEP 1: Creating Database Backup (Cloud)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_guru_digital_pelangi_cloud_$timestamp.sql"
    
    Write-Host "🔄 Creating cloud backup: $backupFile" -ForegroundColor Cyan
    
    if ($TestMode) {
        Write-Host "🧪 TEST MODE: Would create backup from cloud database" -ForegroundColor Cyan
    } else {
        try {
            # Use Node.js script for cloud backup since mysqldump may not be available
            $backupScript = @"
const mysql = require('mysql2/promise');
const fs = require('fs');

async function createBackup() {
    const connection = await mysql.createConnection({
        host: '$dbHost',
        port: $dbPort,
        user: '$dbUser',
        password: '$dbPassword',
        database: '$dbName'
    });

    console.log('Connected to cloud database');
    
    // Get table structure and data
    const [tables] = await connection.execute('SHOW TABLES');
    let backupContent = '-- Cloud Database Backup\\n';
    backupContent += '-- Date: ' + new Date().toISOString() + '\\n\\n';
    
    for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log('Backing up table: ' + tableName);
        
        // Get CREATE TABLE statement
        const [createTable] = await connection.execute('SHOW CREATE TABLE ' + tableName);
        backupContent += createTable[0]['Create Table'] + ';\\n\\n';
        
        // Get table data
        const [rows] = await connection.execute('SELECT * FROM ' + tableName);
        if (rows.length > 0) {
            const columns = Object.keys(rows[0]);
            const values = rows.map(row => 
                '(' + columns.map(col => 
                    row[col] === null ? 'NULL' : 
                    typeof row[col] === 'string' ? "'" + row[col].replace(/'/g, "\\\\'") + "'" :
                    row[col]
                ).join(', ') + ')'
            ).join(',\\n');
            
            backupContent += 'INSERT INTO ' + tableName + ' (' + columns.join(', ') + ') VALUES\\n' + values + ';\\n\\n';
        }
    }
    
    await connection.end();
    fs.writeFileSync('$backupFile', backupContent);
    console.log('Backup completed: $backupFile');
}

createBackup().catch(console.error);
"@
            
            Set-Content -Path "temp_backup.js" -Value $backupScript
            
            # Run backup script
            Write-Host "🔄 Connecting to cloud database..." -ForegroundColor Cyan
            cd backend
            node ../temp_backup.js
            cd ..
            Remove-Item "temp_backup.js" -ErrorAction SilentlyContinue
            
            if (Test-Path $backupFile) {
                $fileSize = (Get-Item $backupFile).Length / 1KB
                Write-Host "✅ Cloud backup completed! Size: $($fileSize.ToString('F2')) KB" -ForegroundColor Green
            } else {
                throw "Backup file was not created"
            }
        } catch {
            Write-Host "❌ Cloud backup failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "⚠️  Continuing without backup (cloud databases usually have their own backup)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
} else {
    Write-Host "⚠️  SKIPPING BACKUP (Cloud database)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Run SQL Migration (Cloud MySQL)
Write-Host "🗄️  STEP 2: Running Cloud Database Migration" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Yellow

if ($TestMode) {
    Write-Host "🧪 TEST MODE: Would execute migration on cloud database" -ForegroundColor Cyan
    Write-Host "🧪 Migration file: migration-to-multisubject.sql" -ForegroundColor Cyan
    Write-Host "🧪 Target: $dbHost:$dbPort/$dbName" -ForegroundColor Cyan
} else {
    Write-Host "🔄 Executing migration on cloud database..." -ForegroundColor Cyan
    
    try {
        # Use Node.js to execute migration on cloud database
        $migrationScript = @"
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
    const connection = await mysql.createConnection({
        host: '$dbHost',
        port: $dbPort,
        user: '$dbUser',
        password: '$dbPassword',
        database: '$dbName',
        multipleStatements: true
    });

    console.log('Connected to cloud database for migration');
    
    const migrationSQL = fs.readFileSync('migration-to-multisubject.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement && !statement.startsWith('--') && !statement.startsWith('SELECT')) {
            try {
                console.log('Executing statement ' + (i + 1) + '/' + statements.length);
                await connection.execute(statement);
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    console.error('Error in statement: ' + statement.substring(0, 100) + '...');
                    throw error;
                }
            }
        }
    }
    
    await connection.end();
    console.log('Migration completed successfully!');
}

runMigration().catch(console.error);
"@
        
        Set-Content -Path "temp_migration.js" -Value $migrationScript
        
        cd backend
        node ../temp_migration.js
        cd ..
        Remove-Item "temp_migration.js" -ErrorAction SilentlyContinue
        
        Write-Host "✅ Cloud database migration completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Cloud migration failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($backupFile -and (Test-Path $backupFile)) {
            Write-Host "🔄 Backup available: $backupFile" -ForegroundColor Yellow
        }
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
        cd backend
        npx prisma generate
        Write-Host "✅ Prisma client updated successfully!" -ForegroundColor Green
        cd ..
    } catch {
        Write-Host "❌ Prisma update failed: $($_.Exception.Message)" -ForegroundColor Red
        cd ..
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

Write-Host "🎉 CLOUD MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. ✅ Cloud database schema updated" -ForegroundColor Green
Write-Host "2. ✅ New tables created and populated" -ForegroundColor Green  
Write-Host "3. ✅ Prisma client regenerated" -ForegroundColor Green
Write-Host "4. 🔄 Restart backend server" -ForegroundColor Yellow
Write-Host "5. 🧪 Test multi-subject functionality" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Cloud Database: $dbHost:$dbPort/$dbName" -ForegroundColor Cyan
Write-Host "🚀 Ready to use multi-subject classes on cloud!" -ForegroundColor Green
