async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} failed: HTTP ${res.status}`);
  return res.json();
}

export const fetchArtworks = () => getJson('/api/artworks');
export const fetchExhibitions = () => getJson('/api/exhibitions');
