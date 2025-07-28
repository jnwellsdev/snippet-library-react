#!/usr/bin/env node

// Quick script to find hardcoded colors in CSS files
const fs = require('fs');
const path = require('path');

const colorPatterns = [
  /#[0-9a-fA-F]{3,6}/g,  // Hex colors
  /rgb\([^)]+\)/g,        // RGB colors
  /rgba\([^)]+\)/g,       // RGBA colors
  /\bwhite\b/g,           // White
  /\bblack\b/g,           // Black
];

function findColorsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const colors = [];
    
    colorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        colors.push(...matches);
      }
    });
    
    if (colors.length > 0) {
      console.log(`\n${filePath}:`);
      colors.forEach(color => console.log(`  - ${color}`));
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath);
    } else if (file.endsWith('.css')) {
      findColorsInFile(filePath);
    }
  });
}

console.log('Scanning for hardcoded colors in CSS files...');
scanDirectory('./src');
console.log('\nScan complete!');