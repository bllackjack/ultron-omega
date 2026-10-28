// Loads ~150 public-domain artworks from the Art Institute of Chicago API
// (https://api.artic.edu/docs/). Images are NOT downloaded: the browser loads
// them straight from the museum's IIIF image server, where the size is part of
// the URL. The metadata is cached in server/data/artworks.json after the first run.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, 'data/artworks.json');
const TARGET = 150;
const THEMES = [
  'impressionism', 'landscape', 'portrait', 'still life', 'japanese woodblock',
  'renaissance', 'baroque', 'post-impressionism', 'seascape', 'cubism', 'garden', 'river',
];
const FIELDS = [
  'id', 'title', 'artist_title', 'date_display', 'date_end', 'medium_display',
  'place_of_origin', 'image_id', 'short_description', 'is_public_domain', 'color', 'thumbnail',
].join(',');
const HEADERS = { 'AIC-User-Agent': 'museum-perf-demo (Lighthouse/React Profiler demo)' };

const iiif = (imageId, width) => `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`;

function periodFor(year) {
  if (year == null) return 'Unknown';
  if (year < 1500) return 'Medieval';
  if (year < 1700) return 'Renaissance';
  if (year < 1850) return 'Baroque & Romantic';
  if (year < 1900) return 'Impressionism';
  return 'Modern';
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// AIC gives one dominant colour per artwork; derive a 6-colour palette from it.
function paletteFrom(color) {
  const { h = 30, s = 30, l = 50 } = color ?? {};
  return [
    [h, s, l], [h + 20, s, l - 15], [h - 20, s, l + 15],
    [h + 180, s * 0.6, l], [h, s * 0.4, l - 25], [h + 40, s * 0.8, l + 25],
  ].map(([hh, ss, ll]) => hslToRgb(((hh % 360) + 360) % 360, Math.min(100, ss), Math.max(5, Math.min(95, ll))));
}

function toArtwork(a) {
  return {
    id: a.id,
    title: a.title,
    artist: a.artist_title ?? 'Unknown artist',
    date: a.date_display ?? '',
    year: a.date_end,
    period: periodFor(a.date_end),
    medium: a.medium_display ?? '',
    origin: a.place_of_origin ?? '',
    description: a.short_description ?? '',
    credit: 'Art Institute of Chicago, CC0 Public Domain',
    width: a.thumbnail?.width ?? null,
    height: a.thumbnail?.height ?? null,
    full: iiif(a.image_id, 1686),
    large: iiif(a.image_id, 843),
    thumb: iiif(a.image_id, 400),
    palette: paletteFrom(a.color),
  };
}

async function search(theme) {
  const url = new URL('https://api.artic.edu/api/v1/artworks/search');
  url.searchParams.set('q', theme);
  url.searchParams.set('limit', '40');
  url.searchParams.set('fields', FIELDS);
  url.searchParams.set('query[term][is_public_domain]', 'true');
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`AIC search "${theme}" failed: HTTP ${res.status}`);
  return (await res.json()).data;
}

async function fetchFromAic() {
  const found = new Map();
  for (const theme of THEMES) {
    for (const a of await search(theme)) {
      if (a.image_id && a.is_public_domain && !found.has(a.id)) found.set(a.id, toArtwork(a));
    }
    if (found.size >= TARGET) break;
  }
  return [...found.values()].slice(0, TARGET);
}

export async function loadArtworks() {
  try {
    return JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
  } catch {
    console.log('Fetching artworks from the Art Institute of Chicago API (first run only)…');
    const artworks = await fetchFromAic();
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(artworks, null, 2));
    console.log(`Cached ${artworks.length} artworks in server/data/artworks.json`);
    return artworks;
  }
}
