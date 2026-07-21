// Post-build: copy dist/index.html to dist/404.html for SPA routing on GitHub Pages
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✓ Copied index.html → 404.html (SPA fallback for GitHub Pages)');
} else {
  console.error('✗ index.html not found in dist/');
  process.exit(1);
}