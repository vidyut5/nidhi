#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes bundle size, identifies optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  buildDir: '.next',
  maxBundleSize: 244 * 1024, // 244KB (recommended)
  maxChunkSize: 128 * 1024,  // 128KB per chunk
  reportPath: './performance-report.json'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Bundle size analysis
function analyzeBundleSize() {
  log('📊 Analyzing bundle sizes...', 'blue');
  
  const buildManifest = path.join(CONFIG.buildDir, 'static/chunks/_buildManifest.js');
  const staticDir = path.join(CONFIG.buildDir, 'static/chunks');
  
  if (!fs.existsSync(staticDir)) {
    log('❌ Build directory not found. Run npm run build first.', 'red');
    return null;
  }
  
  const chunks = [];
  const files = fs.readdirSync(staticDir, { recursive: true });
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(staticDir, file);
      const stats = fs.statSync(filePath);
      chunks.push({
        name: file,
        size: stats.size,
        sizeKB: Math.round(stats.size / 1024),
        path: filePath
      });
    }
  });
  
  return chunks.sort((a, b) => b.size - a.size);
}

// Identify large dependencies
function identifyLargeDependencies() {
  log('🔍 Identifying large dependencies...', 'blue');
  
  try {
    // Run webpack-bundle-analyzer in JSON mode
    execSync('npx webpack-bundle-analyzer .next/static/chunks/*.js --mode json --report bundle-report.json', {
      stdio: 'pipe'
    });
    
    if (fs.existsSync('bundle-report.json')) {
      const report = JSON.parse(fs.readFileSync('bundle-report.json', 'utf8'));
      return report;
    }
  } catch (error) {
    log('⚠️  Could not generate bundle analysis. Make sure webpack-bundle-analyzer is installed.', 'yellow');
  }
  
  return null;
}

// Check for duplicate dependencies
function checkDuplicateDependencies() {
  log('🔄 Checking for duplicate dependencies...', 'blue');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const duplicates = [];
  const seen = new Map();
  
  Object.keys(dependencies).forEach(dep => {
    const baseName = dep.replace(/^@[^/]+\//, '').replace(/-\w+$/, '');
    if (seen.has(baseName)) {
      duplicates.push({
        base: baseName,
        packages: [seen.get(baseName), dep]
      });
    } else {
      seen.set(baseName, dep);
    }
  });
  
  return duplicates;
}

// Analyze Core Web Vitals impact
function analyzeCoreWebVitals(chunks) {
  log('⚡ Analyzing Core Web Vitals impact...', 'blue');
  
  const mainChunk = chunks.find(chunk => chunk.name.includes('main')) || chunks[0];
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  
  // Estimates based on bundle size
  const estimates = {
    fcp: Math.max(800, totalSize / 1024 * 10), // Rough estimate
    lcp: Math.max(1200, totalSize / 1024 * 15),
    cls: totalSize > 500 * 1024 ? 0.25 : 0.1, // Larger bundles = more layout shift risk
    fid: mainChunk ? Math.max(100, mainChunk.sizeKB * 2) : 100
  };
  
  return estimates;
}

// Generate optimization recommendations
function generateRecommendations(chunks, duplicates, estimates) {
  log('💡 Generating optimization recommendations...', 'blue');
  
  const recommendations = [];
  
  // Bundle size recommendations
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  if (totalSize > CONFIG.maxBundleSize * 3) {
    recommendations.push({
      type: 'critical',
      category: 'Bundle Size',
      issue: `Total bundle size (${Math.round(totalSize / 1024)}KB) is too large`,
      solution: 'Implement code splitting and lazy loading'
    });
  }
  
  // Large chunk recommendations
  chunks.forEach(chunk => {
    if (chunk.size > CONFIG.maxChunkSize) {
      recommendations.push({
        type: 'warning',
        category: 'Chunk Size',
        issue: `Chunk ${chunk.name} is ${chunk.sizeKB}KB`,
        solution: 'Split this chunk further or lazy load components'
      });
    }
  });
  
  // Duplicate dependency recommendations
  if (duplicates.length > 0) {
    recommendations.push({
      type: 'warning',
      category: 'Dependencies',
      issue: `Found ${duplicates.length} potential duplicate dependencies`,
      solution: 'Review and consolidate similar packages'
    });
  }
  
  // Core Web Vitals recommendations
  if (estimates.fcp > 1800) {
    recommendations.push({
      type: 'warning',
      category: 'Performance',
      issue: `Estimated FCP (${Math.round(estimates.fcp)}ms) is slow`,
      solution: 'Reduce JavaScript bundle size and optimize critical resources'
    });
  }
  
  return recommendations;
}

// Main execution
function runPerformanceCheck() {
  log('🚀 Starting performance analysis...', 'green');
  
  const chunks = analyzeBundleSize();
  if (!chunks) return;
  
  const bundleReport = identifyLargeDependencies();
  const duplicates = checkDuplicateDependencies();
  const estimates = analyzeCoreWebVitals(chunks);
  const recommendations = generateRecommendations(chunks, duplicates, estimates);
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    chunks: chunks.slice(0, 10), // Top 10 largest chunks
    totalBundleSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
    duplicateDependencies: duplicates,
    coreWebVitalsEstimates: estimates,
    recommendations,
    summary: {
      totalChunks: chunks.length,
      largestChunk: chunks[0],
      averageChunkSize: Math.round(chunks.reduce((sum, chunk) => sum + chunk.size, 0) / chunks.length / 1024),
      criticalIssues: recommendations.filter(r => r.type === 'critical').length,
      warnings: recommendations.filter(r => r.type === 'warning').length
    }
  };
  
  // Save report
  fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));
  
  // Display summary
  log('\n📋 Performance Analysis Summary:', 'blue');
  log(`📦 Total chunks: ${report.summary.totalChunks}`);
  log(`📏 Total bundle size: ${Math.round(report.totalBundleSize / 1024)}KB`);
  log(`📊 Average chunk size: ${report.summary.averageChunkSize}KB`);
  log(`🔍 Largest chunk: ${report.summary.largestChunk.name} (${report.summary.largestChunk.sizeKB}KB)`);
  
  // Display recommendations
  if (recommendations.length > 0) {
    log('\n🎯 Recommendations:', 'yellow');
    recommendations.forEach((rec, index) => {
      const icon = rec.type === 'critical' ? '🔴' : '🟡';
      log(`${icon} ${rec.category}: ${rec.issue}`);
      log(`   💡 ${rec.solution}`);
    });
  } else {
    log('\n✅ No performance issues detected!', 'green');
  }
  
  log(`\n📄 Detailed report saved to: ${CONFIG.reportPath}`, 'blue');
  
  // Exit with error code if critical issues found
  const criticalIssues = recommendations.filter(r => r.type === 'critical').length;
  if (criticalIssues > 0) {
    log(`\n❌ Found ${criticalIssues} critical performance issues!`, 'red');
    process.exit(1);
  }
  
  log('\n✅ Performance check completed successfully!', 'green');
}

// CLI execution
if (require.main === module) {
  runPerformanceCheck();
}

module.exports = { runPerformanceCheck };