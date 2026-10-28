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
```

Needs an internet connection. Artwork images are loaded straight from the
[Art Institute of Chicago](https://api.artic.edu/docs/) image server (public
domain, CC0). On first start the server fetches the list of ~150 artworks from
their API and caches it in `server/data/aic-artworks.json` (git-ignored; delete it
to fetch a fresh list). Images are relayed through the Express server
(`/img/...`), because the museum's image server refuses images embedded on other sites.

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
server/            Express: /api/artworks, /api/exhibitions (data from the AIC API), serves client/dist in prod
demo/              fix.patch (2 lines), presenter script
```
