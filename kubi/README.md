# Kubi cube coach

An interactive, picture-led Rubik’s Cube guide for children. English is the default; choose Hebrew in the header. A choice is remembered, and switching languages preserves the current lesson. Direct language links use ?lang=en or ?lang=he.

This build is static and uses browser-local storage. It does not send cube colors or progress to a server. Serve this directory over HTTP; no install or build is needed. The optional exact solver runs in a Web Worker. Cube.js is included under the MIT license in CUBEJS-LICENSE.txt.

The entry on /other/ is maintained in scripts/build_site.py.
