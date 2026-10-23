// Fit the documentation build to Tofu's Free static hosting, which refuses a whole site for one file name it cannot
// serve and publishes at most 500 files. Safe to repeat: a tree that already fits is left unchanged.
//
// 1. Webpack names Docusaurus's runtime chunk `runtime~main.<hash>.js`, but the static host serves only names made of
//    letters, digits, spaces and `-_.@()`. Each locale's chunk becomes `runtime-main.<hash>.js`, and every page or
//    script that names it follows.
// 2. Each locale's build carries its own copy of the same images, named by their content
//    (`assets/images/<name>-<hash>.<ext>`). The French and Simplified Chinese pages show the English copies instead:
//    their pages' `src` attributes and their chunks' `<publicPath> + "assets/images/..."` point at
//    `/docs/assets/images/` (the English locale's public path), and their own byte-identical copies are removed.
//    A copy whose bytes differ from the English one is kept.
const { existsSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } = require('node:fs');
const { basename, dirname, join, resolve } = require('node:path');

const docs = resolve(__dirname, '..', 'editor', 'docs');

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
}

function rewrite(path, edit) {
  const text = readFileSync(path, 'utf8');
  const next = edit(text);
  if (next === text) return false;
  writeFileSync(path, next);
  return true;
}

let rewritten = 0;
for (const path of files(docs)) {
  if (/\.(?:html|js|json|xml)$/.test(path) && rewrite(path, (text) => text.replaceAll('runtime~main', 'runtime-main'))) rewritten += 1;
}
let renamed = 0;
for (const path of files(docs)) {
  if (!basename(path).includes('runtime~main')) continue;
  renameSync(path, join(dirname(path), basename(path).replaceAll('runtime~main', 'runtime-main')));
  renamed += 1;
}
console.log(`Renamed ${renamed} runtime chunks and updated ${rewritten} files that load them.`);

const englishImages = join(docs, 'assets', 'images');
for (const locale of ['fr', 'zh-Hans']) {
  const root = join(docs, locale);
  const images = join(root, 'assets', 'images');
  if (!existsSync(images)) continue;
  const shared = new Set(readdirSync(images).filter((name) => {
    const english = join(englishImages, name);
    return existsSync(english) && readFileSync(english).equals(readFileSync(join(images, name)));
  }));
  const page = new RegExp(`docs/${locale}/assets/images/([^"'\\s)]+)`, 'g');
  let updated = 0;
  for (const path of files(root)) {
    if (!/\.(?:html|js)$/.test(path)) continue;
    const changed = rewrite(path, (text) => text
      .replace(page, (match, name) => (shared.has(name) ? `docs/assets/images/${name}` : match))
      .replace(/[\w$]+\.p\+"assets\/images\/([^"]+)"/g, (match, name) => (shared.has(name) ? `"/docs/assets/images/${name}"` : match)));
    if (changed) updated += 1;
  }
  for (const name of shared) rmSync(join(images, name));
  console.log(`${locale}: shows ${shared.size} shared images from the English build; updated ${updated} files.`);
}
