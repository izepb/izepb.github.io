# izepb.github.io

Personal site, built with [Astro](https://astro.build). Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Edit content

| What | File |
| --- | --- |
| CV (web + PDF) | `src/data/cv.yaml`. Add `hidden: true` to any entry to hide it |
| Publications | `src/data/publications.bib`. See the header comment for custom fields |
| Talks & posters | `src/data/talks.yaml`. Poster files go in `public/posters/` |
| Home page text | `src/pages/index.astro` |

## Preview locally

```sh
npm install
npx playwright install chromium   # once, for the CV PDF
npm run dev                       # http://localhost:4321, live reload
npm run build && npm run preview  # exact production build incl. /cv.pdf
```
