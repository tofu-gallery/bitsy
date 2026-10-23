// Build the complete, self-contained static site without upstream publishing.
// Run npm ci at the repository root and in docs/ before this script.
const { copyFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const root = resolve(__dirname, '..');
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed (${result.signal || result.status})`);
  }
}

run(process.execPath, [resolve(__dirname, 'icon_generator/makeicons.js')]);
run(process.execPath, [resolve(__dirname, 'resource_packager.js')]);
run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['--prefix', resolve(root, 'docs'), 'run', 'build']);
run(process.execPath, [resolve(__dirname, 'tofu-lane-names.cjs')]);
// Free static hosting does not publish Markdown, so the site root carries the license and credits as `.txt` files.
for (const name of ['LICENSE.md', 'CREDITS.md']) {
  copyFileSync(resolve(root, name), resolve(root, 'editor', `${name}.txt`));
}
console.log('Static site ready in editor/. No deployment was performed.');
