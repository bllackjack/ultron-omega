import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
export const ART_DIR = path.join(ROOT, 'server/public/art');
export const DATA_FILE = path.join(ROOT, 'server/data/artworks.json');

export function periodFor(year) {
  if (year == null || Number.isNaN(year)) return 'Unknown';
  if (year < 1500) return 'Medieval';
  if (year < 1700) return 'Renaissance';
  if (year < 1850) return 'Baroque & Romantic';
  if (year < 1900) return 'Impressionism';
  return 'Modern';
}

/**
 * Writes the full-size JPEG, 960px and 480px WebP versions and returns the
 * derived metadata (dimensions, tiny blur placeholder, colour palette).
 */
export async function processImage(id, buffer) {
  await fs.mkdir(path.join(ART_DIR, 'full'), { recursive: true });
  await fs.mkdir(path.join(ART_DIR, 'medium'), { recursive: true });
  await fs.mkdir(path.join(ART_DIR, 'thumb'), { recursive: true });

  const img = sharp(buffer).rotate();
  const { width, height } = await img.metadata();

  await img.clone().jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(ART_DIR, 'full', `${id}.jpg`));
  await img.clone().resize({ width: 960, withoutEnlargement: true }).webp({ quality: 75 }).toFile(path.join(ART_DIR, 'medium', `${id}.webp`));
  await img.clone().resize({ width: 480 }).webp({ quality: 72 }).toFile(path.join(ART_DIR, 'thumb', `${id}.webp`));

  const lqipBuf = await img.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  const { data } = await img.clone().resize(3, 2, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const palette = [];
  for (let i = 0; i < data.length; i += 3) palette.push([data[i], data[i + 1], data[i + 2]]);

  return {
    width,
    height,
    full: `/art/full/${id}.jpg`,
    medium: `/art/medium/${id}.webp`,
    thumb: `/art/thumb/${id}.webp`,
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
    palette,
  };
}

export async function writeData(artworks) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(artworks, null, 2));
  console.log(`\nWrote ${artworks.length} artworks to ${path.relative(ROOT, DATA_FILE)}`);
}
