# Bitsy on Tofu

Bitsy is a little editor for little games, worlds, and stories. Players walk through pixel-art rooms, talk to characters, and explore worlds made directly in the browser. This fork keeps the upstream Bitsy name, logo, favicon, editor, and game engine.

## Running a copy

- Tofu framework preset: `static`.
- **Site root: `editor/`**, containing `index.html`. Import that subdirectory, not the repository root.
- Install command for deployment: none.
- Build command for deployment: none. The `tofu` branch includes the complete static release, including local help pages.
- Output directory: `editor/` relative to the repository; `.` when `editor/` is the import root.
- Environment variables: none.
- Database: none.
- Runtime: static HTTPS hosting and a modern browser. There is no server process, login, or API key.

The editor autosaves the current game in this browser's storage for this site's origin. Data does not sync between devices or users. Clearing browser data or changing the site address can lose that local copy. Use **save game** to download a playable HTML file or **save data** to keep a `.bitsy` backup. Publishing the editor does not automatically publish the game being edited. The workspace is best used on a desktop or laptop.

All editor scripts, images, icons, fonts, and help-page code are hosted with the copy. Two FAQ articles retain nine upstream screenshots hosted on GitHub; viewing those articles can request those public images, but editing, playback, saving, and the rest of the help need no external service. There are no analytics scripts, ads, tracking services, or Tofu-owned accounts. Upstream community and branding links remain available when clicked.

## Adaptations and why

1. Include the upstream documentation build in `editor/docs/`, with English, French, and Simplified Chinese pages. The editor opens these pages inside its About panel; the upstream source checkout omits them, producing a broken help panel until built.
2. Add `dev/tofu-build.cjs` to reproduce the upstream icon/resource generation and documentation build without executing upstream's FTP publishing script.
3. Copy `LICENSE.md` and `CREDITS.md` unchanged into `editor/`, so publishing only the site root still distributes the upstream license and author credits.
4. Add an ignore-rule exception for the prebuilt documentation so a gallery copy needs no package install or build service.

The checked-in editor and engine code are unchanged. `main` mirrors upstream; adaptations are only on `tofu`. The verified release is tagged `pin/2026-10-23`.

## Rebuilding after an upstream update

From the repository root, use Node.js 22 and the two upstream npm lockfiles:

```sh
npm ci --no-audit --no-fund
npm --prefix docs ci --no-audit --no-fund
node dev/tofu-build.cjs
```

The script runs the upstream icon generator, resource packager, and `npm --prefix docs run build`. Docusaurus builds all three documentation locales, then the upstream postprocessor makes asset paths relative. Root npm dependencies are upstream publishing/development tools; they are not needed to serve `editor/`. Build output may include upstream Browserslist freshness warnings; dependency versions are intentionally retained from the upstream lockfiles.

Review and commit the resulting files on `tofu` before updating a gallery pin. Do not run `dev/publish.js`: it is the upstream FTP release utility and is not part of this adaptation.

## Local verification

```sh
python3 -I -m http.server 48273 --bind 127.0.0.1 --directory editor
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' http://127.0.0.1:48273/
```

Both frozen-lockfile installs and the complete build passed on Node.js 22.22.3 / npm 10.9.8. The editor and English, French, and Simplified Chinese documentation entry pages returned HTTP 200. A local HTML asset check found no missing files. Browser checks covered changing the game title, persistence after reload, entering and leaving play mode, opening contextual Room help, exporting HTML, and opening the exported game as its own local page. The exported game rendered a 512-by-512 canvas with no runtime errors or external resource requests. The editor and Room help also had no runtime errors or external resource requests.

The upstream HTML importer includes trailing HTML in its intermediate text result, so its raw text is not byte-identical to the original game data. Parsing both results produced identical world data; the editor and exporter were kept unchanged. The browser driver's navigation-readiness heuristic timed out for the canvas-only exported page, so the page's completed document, rendered canvas, screenshot, and error capture were checked directly. No deployment was performed by this verification.

## Provenance and license

- Upstream: <https://github.com/le-doux/bitsy>
- Upstream branch: `main`
- Upstream commit: `ee412fa8c072d16af4aedd90d4ad3fb7306911b0`
- Upstream package version: `8.14.0`
- Fork: <https://github.com/tofu-gallery/bitsy>
- License: MIT, with the original text in `LICENSE.md` and original author list in `CREDITS.md`. Those files and copyright notices are preserved unchanged; copies are included in the published site root.
