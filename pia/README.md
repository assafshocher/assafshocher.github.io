# PIA public browser demo

Source: https://github.com/assafshocher/PIA, commit 376f227.

The demo uses the real PIA interface with fictional records and browser-local persistence. It has no server, private data, live assistant connection, or file uploads.

To refresh: check out PIA, run `npm ci` and `npm run build:demo`, then replace this directory with `dist-demo/`. Keep this provenance note. The demo build is configured for `/pia/`. The entry on `/other/` is maintained in `scripts/build_site.py`.
