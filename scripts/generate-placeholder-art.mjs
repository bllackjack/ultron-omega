// Offline fallback for `npm run fetch-art`: generates ~150 large, textured,
// abstract "paintings" so the demo works without network access.
import sharp from 'sharp';
import { processImage, writeData, periodFor } from './lib/process-image.mjs';

const TARGET = Number(process.env.ART_COUNT ?? 150);
const W = 1686;
const H = 1264;

let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const hsl = (h, s, l) => `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;

const ARTISTS = [
  'Elise Marchand', 'Tomas Halvorsen', 'Ines Okafor', 'Kenji Arakawa', 'Margit Vos',
  'Luca Bellandi', 'Ada Thornbury', 'Rafael Quintero', 'Sora Nakamura', 'Henrietta Lowe',
];
const SUBJECTS = ['Composition', 'Study', 'Harbour', 'Nocturne', 'Garden', 'Figure', 'Meridian', 'Still Life', 'Field', 'Reverie'];
const MEDIA = ['Oil on canvas', 'Tempera on panel', 'Gouache on paper', 'Oil on linen', 'Watercolour'];
const ORIGINS = ['France', 'Netherlands', 'Italy', 'Japan', 'Norway', 'Spain', 'England'];

function paintingSvg() {
  const hue = rand() * 360;
  const shapes = [];
  for (let i = 0; i < 28; i++) {
    const h = hue + (rand() - 0.5) * 140;
    const fill = hsl(h, 35 + rand() * 50, 25 + rand() * 50);
    const op = (0.35 + rand() * 0.55).toFixed(2);
    if (rand() < 0.5) {
      shapes.push(`<circle cx="${rand() * W}" cy="${rand() * H}" r="${40 + rand() * 360}" fill="${fill}" opacity="${op}"/>`);
    } else {
      shapes.push(`<rect x="${rand() * W}" y="${rand() * H}" width="${60 + rand() * 600}" height="${60 + rand() * 500}"
        transform="rotate(${(rand() - 0.5) * 40} ${W / 2} ${H / 2})" fill="${fill}" opacity="${op}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${hsl(hue, 40, 80)}"/><stop offset="1" stop-color="${hsl(hue + 60, 45, 22)}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>${shapes.join('')}</svg>`;
}

// Canvas-like grain so the JPEGs weigh about as much as real photographed paintings.
const noise = Buffer.alloc(W * H);
for (let i = 0; i < noise.length; i++) noise[i] = Math.floor(rand() * 255);
const grain = await sharp(noise, { raw: { width: W, height: H, channels: 1 } }).blur(0.6).png().toBuffer();

const artworks = [];
for (let i = 0; i < TARGET; i++) {
  const id = 900000 + i;
  const buffer = await sharp(Buffer.from(paintingSvg()))
    .composite([{ input: grain, blend: 'soft-light' }])
    .jpeg({ quality: 92 })
    .toBuffer();
  const year = 1300 + Math.floor(rand() * 700);
  artworks.push({
    id,
    title: `${pick(SUBJECTS)} No. ${i + 1}`,
    artist: pick(ARTISTS),
    artistDisplay: '',
    date: String(year),
    year,
    period: periodFor(year),
    medium: pick(MEDIA),
    origin: pick(ORIGINS),
    description: 'Generated placeholder artwork (run `npm run fetch-art` online for real public-domain paintings).',
    credit: 'Generated placeholder',
    ...(await processImage(id, buffer)),
  });
  process.stdout.write(`\r  generated ${i + 1}/${TARGET}`);
}
await writeData(artworks);
