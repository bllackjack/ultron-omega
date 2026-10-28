import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exhibitionsFor } from './exhibitions.js';
import { loadArtworks } from './aic.js';

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

if (isProd) {
  app.use(express.static(DIST, { index: false, maxAge: '1y', immutable: true }));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Museum API listening on http://localhost:${PORT}${isProd ? ' (serving client/dist)' : ''}`);
});
