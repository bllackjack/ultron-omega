// Exhibitions reference artworks by position so they work with either the
// real (fetch-art) or generated (generate-art) collection.
const EXHIBITIONS = [
  {
    slug: 'light-and-water',
    title: 'Light & Water',
    subtitle: 'Painters of the shifting surface, 1860–1920',
    start: '2026-09-12',
    end: '2027-01-24',
    gallery: 'Regenstein Hall',
    status: 'current',
    artIndex: 0,
  },
  {
    slug: 'the-quiet-object',
    title: 'The Quiet Object',
    subtitle: 'Four centuries of still life',
    start: '2026-11-20',
    end: '2027-03-08',
    gallery: 'East Wing, Level 2',
    status: 'upcoming',
    artIndex: 7,
  },
  {
    slug: 'faces-of-the-city',
    title: 'Faces of the City',
    subtitle: 'Portraiture and the urban crowd',
    start: '2027-02-05',
    end: '2027-06-14',
    gallery: 'Galleries 240–247',
    status: 'upcoming',
    artIndex: 14,
  },
  {
    slug: 'floating-world',
    title: 'The Floating World',
    subtitle: 'Woodblock prints from Edo to Meiji',
    start: '2027-04-10',
    end: '2027-08-30',
    gallery: 'Asian Art Galleries',
    status: 'upcoming',
    artIndex: 21,
  },
];

export function exhibitionsFor(artworks) {
  return EXHIBITIONS.map(({ artIndex, ...ex }) => ({
    ...ex,
    artwork: artworks[artIndex % artworks.length],
  }));
}
