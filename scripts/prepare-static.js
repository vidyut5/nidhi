const fs = require('fs');
const path = require('path');

console.log('🔄 Preparing project for static export...');

// Directories to exclude from static export
const excludeDirs = [
  'app/api',
  'app/admin',
  'prisma',
  'scripts'
];

// Files to exclude from static export
const excludeFiles = [
  'lib/prisma.ts',
  'lib/admin-session.ts',
  'app/orders/page.tsx',
  'lib/auth.ts'
];

// Create backup directories
const backupDir = '.static-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Backup and remove excluded directories
excludeDirs.forEach(dir => {
  const sourcePath = path.join(process.cwd(), dir);
  const backupPath = path.join(process.cwd(), backupDir, dir);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`📦 Backing up ${dir}...`);
    // Create backup
    if (!fs.existsSync(path.dirname(backupPath)) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }
    fs.renameSync(sourcePath, backupPath);
    console.log(`✅ Backed up ${dir}`);
  }
});

// Backup and remove excluded files
excludeFiles.forEach(file => {
  const sourcePath = path.join(process.cwd(), file);
  const backupPath = path.join(process.cwd(), backupDir, file);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`📦 Backing up ${file}...`);
    // Create backup directory
    if (!fs.existsSync(path.dirname(backupPath)) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }
    fs.renameSync(sourcePath, backupPath);
    console.log(`✅ Backed up ${file}`);
  }
});

console.log('✅ Project prepared for static export!');
console.log('📁 Backup created in .static-backup/');
console.log('🔄 Run "npm run restore-static" to restore after build');
