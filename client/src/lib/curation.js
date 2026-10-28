// "Curator's picks" ranking: artworks whose colour palettes harmonise with the
// rest of the collection float to the top. Compares the key colours of every
// artwork against every other artwork, in CIELAB space.

const KEY_COLOURS = 2;

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function labF(t) {
  return t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29;
}

export function rgbToLab([r, g, b]) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  const x = labF((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047);
  const y = labF(0.2126 * R + 0.7152 * G + 0.0722 * B);
  const z = labF((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function deltaE(a, b) {
  const [l1, a1, b1] = rgbToLab(a);
  const [l2, a2, b2] = rgbToLab(b);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

function harmony(paletteA, paletteB) {
  let total = 0;
  const keysA = paletteA.slice(0, KEY_COLOURS);
  const keysB = paletteB.slice(0, KEY_COLOURS);
  for (const ca of keysA) {
    for (const cb of keysB) {
      const d = deltaE(ca, cb);
      // Analogous (close) and complementary (far) colours both read as harmonious.
      total += Math.exp(-((d - 12) ** 2) / 200) + 0.5 * Math.exp(-((d - 70) ** 2) / 400);
    }
  }
  return total / (keysA.length * keysB.length);
}

export function rankByCuratorScore(artworks) {
  const scored = artworks.map((artwork) => {
    let score = 0;
    for (const other of artworks) {
      if (other !== artwork) score += harmony(artwork.palette, other.palette);
    }
    return { ...artwork, curatorScore: score / Math.max(1, artworks.length - 1) };
  });
  return scored.sort((a, b) => b.curatorScore - a.curatorScore);
}
