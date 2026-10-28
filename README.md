# Meridian Museum of Art — performance demo

A one-page art museum site (React + Vite front end, Express API) built to demo
**Lighthouse** and the **React DevTools Profiler**. The committed code has a
deliberate performance bug; `demo/fix.patch` fixes it with a **2-line change**.

> Presenter notes (what the bug is, and the talk track) are in
> [`demo/DEMO_SCRIPT.md`](demo/DEMO_SCRIPT.md). Don't show that file on screen.

## Setup

Requires Node 18.18+.

```bash
npm install
npm run fetch-art      # downloads ~150 public-domain paintings from the Art Institute of Chicago (online, once)
# or, offline:
npm run generate-art   # generates 150 abstract placeholder paintings instead
```

Art is stored in `server/public/art/` and `server/data/artworks.json` (git-ignored).

## Running

| Command | What it does | Use it for |
| --- | --- | --- |
| `npm run dev` | Express API on :4000 + Vite dev server on **http://localhost:5173** | React DevTools Profiler |
| `npm run prod` | Production build served by Express on **http://localhost:4000** | Lighthouse |

## Project layout

```
client/            React app (Vite root)
  src/components/  Header, Hero, Exhibitions, CollectionGallery, ArtworkCard, ArtworkModal, Footer
  src/lib/         curation ranking, date formatting
server/            Express: /api/artworks, /api/exhibitions, /art/* images, serves client/dist in prod
scripts/           fetch-art (real paintings) and generate-art (offline placeholders)
demo/              fix.patch (2 lines), example Lighthouse before/after reports, presenter script
```
