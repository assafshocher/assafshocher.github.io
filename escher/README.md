# Moore, Escher, Penrose — project page

Static GitHub Pages project at `/escher/`.

- `index.html`: overview, author links, abstract, method, citation.
- `supplement.html`: complete 64-image interactive supplement.
- `assets/site.css` and `assets/site.js`: overview styles and behavior.
- `assets/dive.js`: shared transform-specific WebGL renderer used by the overview.
- `assets/gallery.json`: supplied images, prompts, and display-motion settings.
- `assets/images/`: full-resolution gallery images.
- `assets/posters/`: first-frame previews for the gallery cards.
- `assets/media/`: looping teaser and homepage reviewer preview, with posters.

The paper, code, and Sophia Feldman homepage links are deliberately inactive placeholders in `index.html`. Replace their `href` values and remove `placeholder`, `aria-disabled`, the placeholder `title`, and the `soon` span when those URLs are available. The matching homepage entry is the first item in the root `index.html` publications array. Its paper/code buttons can then be added to its `links` object.

The citation currently uses a project-page `@misc` entry dated 2026. Replace it with the final paper citation when available; keep the root homepage entry in sync.

Serve the repository root with a local HTTP server for preview (the overview fetches its gallery metadata). No build step or package installation is required. Images load lazily, and hover motion is rendered on demand. The opening video pauses off screen, and automatic motion respects reduced-motion preferences.

## Sources and display conventions

The paper text and result images are supplied by the authors. The method image is rendered from the supplied manuscript figure. The early blurred method preview is illustrative, as disclosed in the caption.

The Escher panel uses the completed reconstruction and animation from the Leiden Escher–Droste project:
https://pub.math.leidenuniv.nl/~smitbde/escherdroste/

The displayed animations are views of the supplied results, not additional generated frames. The high-detail renderer uses equivalent repeated image regions where appropriate. Rimrings, including the teaser's pasta panel, retains the separate direct radial renderer; no inverse was used for Rimrings generation.

Caveat is bundled under the SIL Open Font License (`assets/fonts/OFL.txt`). The local GitHub and Twitter outline icons in the homepage and Linearizer page are from Lucide 0.468.0; their license is in `/licenses/lucide-icons.txt`. They are embedded as SVGs so changes to the externally loaded Lucide package cannot remove them.

The three Escher+Dali pocket-watch results use Möbius and poles flows at source scale 16, and the square flow at source scale 4. Their still previews are rendered at phase zero with the same display shader as the animations.
