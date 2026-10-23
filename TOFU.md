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
3. Copy `LICENSE.md` and `CREDITS.md` unchanged into `editor/` as `LICENSE.md.txt` and `CREDITS.md.txt`, so publishing only the site root still distributes the upstream license and author credits. Tofu's Free static hosting serves `.txt` files but does not publish Markdown.
4. Add an ignore-rule exception for the prebuilt documentation so a gallery copy needs no package install or build service.
5. Rename the documentation's webpack runtime chunk from `runtime~main.<hash>.js` to `runtime-main.<hash>.js` in each locale (`docs/assets/js/`, `docs/fr/assets/js/`, `docs/zh-Hans/assets/js/`) and update the 141 help pages that load it. Tofu's Free static hosting refuses a whole site for one file name containing `~`; it serves names made of letters, digits, spaces, and `-_.@()`. Only the pages' `<script>` and preload tags name the chunk, and its code is unchanged.
6. Remove `icons/bitsy.hqx`, `icons/bitsy.icns`, and `image/bitsy.icns` from `editor/`. They are Mac application icon formats that nothing in the editor, engine, exporter, or help loads (the page icon is `image/cat5.png`), and Tofu's Free static hosting refuses a site containing file types it does not serve. Upstream's copies remain on `main`.
7. Show the French and Simplified Chinese help pages the English build's copies of their 42 images, and remove their own copies. Docusaurus gives every locale its own byte-identical copy of each image, named by its content, and Tofu's Free static hosting publishes at most 500 files: the three locales made the site 522 files, and sharing the images brings it to 438. Only the image paths change: the pages' `src` attributes and the page chunks' `<publicPath> + "assets/images/..."` now point at `docs/assets/images/`, the English locale's folder. The chunks already load everything from absolute `/docs/...` paths, so the site is still served from its own root.

`dev/tofu-static-docs.cjs` makes changes 5 and 7, and `dev/tofu-build.cjs` runs it after every documentation build. The checked-in editor and engine code are unchanged. `main` mirrors upstream; adaptations are only on `tofu`. The verified release is tagged `pin/2026-10-23.1`. The earlier `pin/2026-10-23` predates adaptations 5 to 7 and the `.txt` license copies, so Tofu's Free static hosting refuses it.

## Rebuilding after an upstream update

From the repository root, use Node.js 22 and the two upstream npm lockfiles:

```sh
npm ci --no-audit --no-fund
npm --prefix docs ci --no-audit --no-fund
node dev/tofu-build.cjs
```

The script runs the upstream icon generator, resource packager, and `npm --prefix docs run build`. Docusaurus builds all three documentation locales, then the upstream postprocessor makes asset paths relative. The script then runs `dev/tofu-static-docs.cjs` and writes the `.txt` license copies. Root npm dependencies are upstream publishing/development tools; they are not needed to serve `editor/`. Build output may include upstream Browserslist freshness warnings; dependency versions are intentionally retained from the upstream lockfiles.

Review and commit the resulting files on `tofu` before updating a gallery pin. Do not run `dev/publish.js`: it is the upstream FTP release utility and is not part of this adaptation.

## Local verification

```sh
python3 -I -m http.server 48273 --bind 127.0.0.1 --directory editor
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' http://127.0.0.1:48273/
```

For the first pin, both frozen-lockfile installs and the complete build passed on Node.js 22.22.3 / npm 10.9.8. The editor and English, French, and Simplified Chinese documentation entry pages returned HTTP 200. A local HTML asset check found no missing files other than the links described below. Browser checks covered changing the game title, persistence after reload, entering and leaving play mode, opening contextual Room help, exporting HTML, and opening the exported game as its own local page. The exported game rendered a 512-by-512 canvas with no runtime errors or external resource requests. The editor and Room help also had no runtime errors or external resource requests.

The upstream HTML importer includes trailing HTML in its intermediate text result, so its raw text is not byte-identical to the original game data. Parsing both results produced identical world data; the editor and exporter were kept unchanged. The browser driver's navigation-readiness heuristic timed out for the canvas-only exported page, so the page's completed document, rendered canvas, screenshot, and error capture were checked directly. No deployment was performed by this verification.

For `pin/2026-10-23.1` (adaptations 5 to 7 and the `.txt` license copies), `node dev/tofu-static-docs.cjs` was run on the committed documentation build: it renamed the three runtime chunks and updated the 141 pages that load them, and in each of French and Simplified Chinese it removed 42 duplicate images and updated 52 files (26 pages and 26 chunks) that show them. A second run changed nothing. Undoing only the image-path change in each of those 104 files gives back the original bytes, and every one of the 42 image paths the chunks now name exists in `docs/assets/images/`. The full rebuild was not repeated. The `.txt` license copies are byte-identical to the root `LICENSE.md` and `CREDITS.md`. A check of all 5,405 local `src` and `href` references in the site's pages, matching names exactly as a web host does, finds nine targets missing, the same nine as in the first pin. Three are the 404 page's language-menu links to `404/`, which Docusaurus does not generate. Six are upstream content links that differ from their folders only by letter case: `category/FAQ/` for `category/faq/` on each home page, and `tools/recordGIF/` for `tools/recordgif/` on each Room Editing Tools page. They are left as upstream wrote them.

A copy of `editor/` without the folders Tofu's import drops was served on 127.0.0.1 with Python's `http.server` handler. Its default five-connection listen queue occasionally reset one of the editor's roughly 50 parallel script loads, so the browser checks used the same handler with a deeper queue. In the browser, the editor loaded all its resources with no console errors, entered and left play mode, and opened contextual Paint and Room help in its About panel, which loaded `runtime-main.8e302f87.js` and the Room diagram with no failed requests. `/docs/`, `/docs/fr/`, and `/docs/zh-Hans/` each loaded its own `runtime-main` chunk with HTTP 200, rendered its title, and opened its next page through the site's own navigation. In each locale, the Colors page showed its image on a direct load, and the Room page showed its diagram after a sidebar click rendered it from the page chunk; the French and Chinese images came from `docs/assets/images/`. There were no console errors and no failed or outside requests from the site.

Tofu's own check, which imports the branch the way Tofu's GitHub import does and runs Tofu's hosting predicates, reports `-> static (finished site)`, with 438 of the 441 files in `editor/` published (the three `.nojekyll` files are skipped). Its safety check reports three `obfuscated-code` findings, one in each locale's `runtime-main` chunk. Each matches only webpack's standard global-object fallback, `new Function("return this")()`. This is a known false positive in Tofu's rule, being fixed in the platform, so the minified chunks are left unedited. A simulation of Tofu's import keeps all 441 files and drops none. The release's GitHub archive is about 11.9 MB, under the 50 MB limit.

## Provenance and license

- Upstream: <https://github.com/le-doux/bitsy>
- Upstream branch: `main`
- Upstream commit: `ee412fa8c072d16af4aedd90d4ad3fb7306911b0`
- Upstream package version: `8.14.0`
- Fork: <https://github.com/tofu-gallery/bitsy>
- License: MIT, with the original text in `LICENSE.md` and original author list in `CREDITS.md`. Those files and copyright notices are preserved unchanged; copies are included in the published site root as `LICENSE.md.txt` and `CREDITS.md.txt`.
