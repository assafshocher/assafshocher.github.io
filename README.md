# Assaf Shocher’s homepage

Static website served by GitHub Pages from the `main` branch.

## Editing

- Edit `members.json` for names, roles, portraits, and profile links.
- Edit `publications.json` for publication details and media.
- Edit `scripts/build_site.py` for page text and HTML templates.
- `style.css` and `site.js` provide the shared design and interactions.

Run `python3 scripts/build_site.py` after changing the data or templates, and commit the generated HTML along with the source changes. No build step is required on the server.

To preview locally, run `python3 -m http.server 8765 --bind 127.0.0.1` from the repository root and open http://127.0.0.1:8765/.

## Behavior

Publications live on Home. Cards expand in the page layout on hover or click, with a year filter and an option to disable hover expansion. Group members appear in a newly randomized order on each reload. About includes a copyable third-person bio for talks.

Images, publication animations, and KaTeX are served locally. The existing Google Analytics property is retained and records only on the live website. KaTeX’s license is in `assets/katex/LICENSE`. Existing project and game directories are maintained independently of the homepage generator.
