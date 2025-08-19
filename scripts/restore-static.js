const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring project from static export...');

const backupDir = '.static-backup';

if (!fs.existsSync(backupDir)) {
  console.log('❌ No backup found. Nothing to restore.');
  process.exit(1);
}

// Restore excluded directories
const excludeDirs = [
  'app/api',
  'app/admin',
  'prisma',
  'scripts'
];

excludeDirs.forEach(dir => {
  const sourcePath = path.join(process.cwd(), backupDir, dir);
  const restorePath = path.join(process.cwd(), dir);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`📦 Restoring ${dir}...`);
    // Remove existing if any
    if (fs.existsSync(restorePath)) {
      fs.rmSync(restorePath, { recursive: true, force: true });
    }
    // Restore from backup
    fs.renameSync(sourcePath, restorePath);
    console.log(`✅ Restored ${dir}`);
  }
});

// Restore excluded files
const excludeFiles = [
  'lib/prisma.ts',
  'lib/admin-session.ts'
];

excludeFiles.forEach(file => {
  const sourcePath = path.join(process.cwd(), backupDir, file);
  const restorePath = path.join(process.cwd(), file);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`📦 Restoring ${file}...`);
    // Remove existing if any
    if (fs.existsSync(restorePath)) {
      fs.unlinkSync(restorePath);
    }
    // Restore from backup
    fs.renameSync(sourcePath, restorePath);
    console.log(`✅ Restored ${file}`);
  }
});

// Clean up backup directory
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true });
  console.log('🧹 Cleaned up backup directory');
}

console.log('✅ Project restored successfully!');
console.log('🚀 Ready for development with full functionality');
