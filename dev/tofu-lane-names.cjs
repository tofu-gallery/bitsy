// Give the documentation build file names that Tofu's Free static hosting serves.
// Webpack names Docusaurus's runtime chunk `runtime~main.<hash>.js`, but the static host serves only names made of
// letters, digits, spaces and `-_.@()`. Each locale's chunk becomes `runtime-main.<hash>.js`, and every page or
// script that names it follows. Safe to repeat: a tree with no `runtime~main` left is unchanged.
const { readdirSync, readFileSync, renameSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const FROM = 'runtime~main';
const TO = 'runtime-main';
let renamed = 0;
let rewritten = 0;

function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      visit(path);
      continue;
    }
    if (/\.(?:html|js|json|xml)$/.test(entry.name)) {
      const text = readFileSync(path, 'utf8');
      if (text.includes(FROM)) {
        writeFileSync(path, text.replaceAll(FROM, TO));
        rewritten += 1;
      }
    }
    if (entry.name.includes(FROM)) {
      renameSync(path, join(dir, entry.name.replaceAll(FROM, TO)));
      renamed += 1;
    }
  }
}

visit(resolve(__dirname, '..', 'editor', 'docs'));
console.log(`Renamed ${renamed} runtime chunks and updated ${rewritten} files that load them.`);
