import express from 'express';
import compression from 'compression';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exhibitionsFor } from './exhibitions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 4000);
const isProd = process.env.NODE_ENV === 'production';
const DATA_FILE = path.join(__dirname, 'data/artworks.json');
const DIST = path.join(__dirname, '../client/dist');

function loadArtworks() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('No artwork data found. Run `npm run fetch-art` (online) or `npm run generate-art` (offline) first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

const artworks = loadArtworks();
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

app.use('/art', express.static(path.join(__dirname, 'public/art'), { maxAge: '7d', immutable: true }));

if (isProd) {
  app.use(express.static(DIST, { index: false, maxAge: '1y', immutable: true }));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Museum API listening on http://localhost:${PORT}${isProd ? ' (serving client/dist)' : ''}`);
});
