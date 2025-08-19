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
  'lib/admin-session.ts'
];

// Files that need to be modified to remove server-side imports
const modifyFiles = [
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
    if (!fs.existsSync(path.dirname(backupPath))) {
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
    if (!fs.existsSync(path.dirname(backupPath))) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }
    fs.renameSync(sourcePath, backupPath);
    console.log(`✅ Backed up ${file}`);
  }
});

// Modify files to remove server-side imports
modifyFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const backupPath = path.join(process.cwd(), backupDir, file);
  
  if (fs.existsSync(filePath)) {
    console.log(`📝 Modifying ${file}...`);
    
    // Create backup
    if (!fs.existsSync(path.dirname(backupPath))) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }
    fs.copyFileSync(filePath, backupPath);
    
    // Read and modify content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove prisma imports and related code
    content = content.replace(/import\s*{\s*prisma\s*}\s*from\s*['"]@\/lib\/prisma['"];?\s*/g, '');
    content = content.replace(/import\s*{\s*prisma\s*}\s*from\s*['"]@\/lib\/prisma['"];?\s*/g, '');
    
    // Remove any prisma usage
    content = content.replace(/prisma\.[a-zA-Z]+\.[a-zA-Z]+\([^)]*\)/g, 'null');
    content = content.replace(/await\s+prisma\.[a-zA-Z]+\.[a-zA-Z]+\([^)]*\)/g, 'null');
    
    // Write modified content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Modified ${file}`);
  }
});

console.log('✅ Project prepared for static export!');
console.log('📁 Backup created in .static-backup/');
console.log('🔄 Run "npm run restore-static" to restore after build');
