const fs = require('fs');
const path = require('path');

console.log('Preparing project for static export...');

const backupDir = '.static-backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const excludeDirs = ['app/api', 'app/admin', 'prisma', 'scripts'];
const excludeFiles = ['lib/prisma.ts', 'lib/admin-session.ts', 'lib/seed-demo.ts', 'app/orders/page.tsx', 'lib/auth.ts'];

excludeDirs.forEach(dir => {
  const sourcePath = path.join(process.cwd(), dir);
  const backupPath = path.join(process.cwd(), backupDir, dir);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`Backing up ${dir}...`);
    if (!fs.existsSync(path.dirname(backupPath))) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }
    fs.renameSync(sourcePath, backupPath);
    console.log(`Backed up ${dir}`);
  }
});

excludeFiles.forEach(file => {
  const sourcePath = path.join(process.cwd(), file);
  const backupPath = path.join(process.cwd(), backupDir, file);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`Backing up ${file}...`);
    if (!fs.existsSync(path.dirname(backupPath))) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    }
    fs.renameSync(sourcePath, backupPath);
    console.log(`Backed up ${file}`);
  }
});

console.log('Project prepared for static export!');
console.log('Backup created in .static-backup/');
console.log('Run "npm run restore-static" to restore after build');
