const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define replacements
const replacements = [
  // Replace accent colors with gray
  { from: /--accent-9/g, to: '--gray-9' },
  { from: /--accent-10/g, to: '--gray-10' },
  { from: /--accent-8/g, to: '--gray-8' },
  { from: /--accent-7/g, to: '--gray-7' },
  { from: /--accent-11/g, to: '--gray-11' },
  { from: /--accent-12/g, to: '--gray-12' },
  
  // Replace contrast colors with white
  { from: /--accent-9-contrast/g, to: 'white' },
  { from: /--accent-10-contrast/g, to: 'white' },
  { from: /--green-9-contrast/g, to: 'white' },
  { from: /--red-9-contrast/g, to: 'white' },
  
  // Replace alpha colors
  { from: /--accent-a([0-9]+)/g, to: '--gray-a$1' },
];

// Find all CSS files
const cssFiles = glob.sync('src/**/*.css', { cwd: process.cwd() });

console.log(`Found ${cssFiles.length} CSS files to process...`);

cssFiles.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content;
  let hasChanges = false;
  
  replacements.forEach(({ from, to }) => {
    if (newContent.match(from)) {
      newContent = newContent.replace(from, to);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
});

console.log('✅ All undefined CSS variables have been fixed!');
