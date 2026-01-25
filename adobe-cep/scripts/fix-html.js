import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, '../dist/index.html');

let html = readFileSync(htmlPath, 'utf8');

// Move module script to end of body, after CSInterface
html = html.replace(
  /<script type="module" crossorigin src="([^"]+)"><\/script>/,
  ''
);

// Extract the module src from original
const moduleMatch = html.match(/src="(\.\/assets\/[^"]+\.js)"/);
if (!moduleMatch) {
  // Re-read to get the module src
  const originalHtml = readFileSync(htmlPath, 'utf8');
  const srcMatch = originalHtml.match(/src="(\.\/assets\/index[^"]*\.js)"/);
  if (srcMatch) {
    html = html.replace(
      '</body>',
      `  <script type="module" crossorigin src="${srcMatch[1]}"></script>\n  </body>`
    );
  }
} else {
  // Module script already removed, just add after CSInterface
  html = html.replace(
    '</body>',
    `  <script type="module" crossorigin src="./assets/index.js"></script>\n  </body>`
  );
}

// Clean up any empty lines in head
html = html.replace(/\n\s*\n/g, '\n');

writeFileSync(htmlPath, html);
console.log('Fixed dist/index.html script order');
