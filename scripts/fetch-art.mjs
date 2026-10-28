// Downloads ~150 public-domain artworks from the Art Institute of Chicago
// open-access API (https://api.artic.edu/docs/) and stores them locally so the
// demo runs offline. Run once: `npm run fetch-art`.
import { processImage, writeData, periodFor } from './lib/process-image.mjs';

const TARGET = Number(process.env.ART_COUNT ?? 150);
const THEMES = [
  'impressionism', 'landscape', 'portrait', 'still life', 'japanese woodblock',
  'renaissance', 'baroque', 'post-impressionism', 'seascape', 'cubism', 'garden', 'river',
];
const FIELDS = [
  'id', 'title', 'artist_title', 'artist_display', 'date_display', 'date_end',
  'medium_display', 'place_of_origin', 'image_id', 'short_description', 'is_public_domain',
].join(',');
const HEADERS = { 'AIC-User-Agent': 'museum-perf-demo (local Lighthouse/React Profiler demo)' };

async function search(theme) {
  const url = new URL('https://api.artic.edu/api/v1/artworks/search');
  url.searchParams.set('q', theme);
  url.searchParams.set('limit', '40');
  url.searchParams.set('fields', FIELDS);
  url.searchParams.set('query[term][is_public_domain]', 'true');
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Search "${theme}" failed: HTTP ${res.status}`);
  return (await res.json()).data;
}

async function download(imageId) {
  for (const size of ['1686,', '843,']) {
    const res = await fetch(`https://www.artic.edu/iiif/2/${imageId}/full/${size}/0/default.jpg`, { headers: HEADERS });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`Could not download image ${imageId}`);
}

const candidates = new Map();
for (const theme of THEMES) {
  try {
    for (const a of await search(theme)) {
      if (a.image_id && a.is_public_domain && !candidates.has(a.id)) candidates.set(a.id, a);
    }
    console.log(`"${theme}": ${candidates.size} candidates so far`);
  } catch (err) {
    console.warn(err.message);
  }
  if (candidates.size >= TARGET * 1.3) break;
}

if (candidates.size === 0) {
  console.error('\nNo artworks found. Are you offline? Use `npm run generate-art` instead.');
  process.exit(1);
}

const queue = [...candidates.values()];
const artworks = [];
async function worker() {
  while (artworks.length < TARGET && queue.length) {
    const a = queue.shift();
    try {
      const meta = await processImage(a.id, await download(a.image_id));
      artworks.push({
        id: a.id,
        title: a.title,
        artist: a.artist_title ?? 'Unknown artist',
        artistDisplay: a.artist_display ?? '',
        date: a.date_display ?? '',
        year: a.date_end,
        period: periodFor(a.date_end),
        medium: a.medium_display ?? '',
        origin: a.place_of_origin ?? '',
        description: a.short_description ?? '',
        credit: 'Art Institute of Chicago, CC0 Public Domain',
        ...meta,
      });
      process.stdout.write(`\r  downloaded ${artworks.length}/${TARGET}`);
    } catch (err) {
      console.warn(`\n  skipped ${a.id}: ${err.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
await writeData(artworks.slice(0, TARGET));
