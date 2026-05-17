// bump-version.js — run before each deploy to force-fresh assets on user browsers
// Usage:  node bump-version.js

const fs = require('fs');
const path = require('path');

// Generate a fresh version string from current date+time
const now = new Date();
const NEW_VERSION = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

console.log(`New version: ${NEW_VERSION}`);

// Recursively find all .html, .js, .css files (excluding node_modules)
function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(html|js|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const files = walk(__dirname);
let count = 0;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  const original = content;
  // Replace any ?v=YYYYMMDDHHmm or ?v=YYYYMMDD with the new version
  content = content.replace(/\?v=\d{8,12}/g, `?v=${NEW_VERSION}`);
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    count++;
    console.log(`✓ ${path.relative(__dirname, f)}`);
  }
}

console.log(`\nUpdated ${count} files. Now: git add . && git commit -m "Bump cache version" && git push`);
