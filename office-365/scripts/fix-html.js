import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, '../dist/index.html');

let html = readFileSync(htmlPath, 'utf8');

// Ensure Office.js script is loaded first (it should be in head)
// Check if office.js is already in the file
if (!html.includes('office.js')) {
  // Add Office.js to head
  html = html.replace(
    '</head>',
    '  <script src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"></script>\n  </head>'
  );
}

// Clean up any empty lines
html = html.replace(/\n\s*\n\s*\n/g, '\n\n');

writeFileSync(htmlPath, html);
console.log('Fixed dist/index.html for Office Add-in');
