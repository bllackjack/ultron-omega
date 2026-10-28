import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exhibitionsFor } from './exhibitions.js';
import { Readable } from 'node:stream';
import { HEADERS, IMAGE_WIDTHS, iiifUrl, loadArtworks } from './aic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 4000);
const isProd = process.env.NODE_ENV === 'production';
const DIST = path.join(__dirname, '../client/dist');

let artworks;
try {
  artworks = await loadArtworks();
} catch (err) {
  console.error(`Could not load artworks (are you online?): ${err.message}`);
  process.exit(1);
}
const exhibitions = exhibitionsFor(artworks);
const app = express();

app.use(compression());

app.get('/api/artworks', (_req, res) => res.json(artworks));

app.get('/api/artworks/:id', (req, res) => {
  const artwork = artworks.find((a) => String(a.id) === req.params.id);
  if (!artwork) return res.status(404).json({ error: 'Artwork not found' });
  res.json(artwork);
});

app.get('/api/exhibitions', (_req, res) => res.json(exhibitions));

// Relays artwork images from the museum's image server so the page loads them
// from its own origin (the museum blocks images embedded on other sites).
const IMAGE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
app.get('/img/:imageId/:width', async (req, res) => {
  const { imageId, width } = req.params;
  if (!IMAGE_ID.test(imageId) || !IMAGE_WIDTHS.includes(width)) return res.sendStatus(404);
  try {
    const upstream = await fetch(iiifUrl(imageId, width), { headers: HEADERS });
    if (!upstream.ok || !upstream.body) return res.sendStatus(upstream.status === 404 ? 404 : 502);
    res.set('Content-Type', upstream.headers.get('content-type') ?? 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=604800');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    console.warn(`Image ${imageId}/${width} failed: ${err.message}`);
    res.sendStatus(502);
  }
});

if (isProd) {
  app.use(express.static(DIST, { index: false, maxAge: '1y', immutable: true }));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Museum API listening on http://localhost:${PORT}${isProd ? ' (serving client/dist)' : ''}`);
});
