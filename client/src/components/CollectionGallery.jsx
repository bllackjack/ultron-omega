import { useState } from 'react';
import { rankByCuratorScore } from '../lib/curation.js';
import ArtworkCard from './ArtworkCard.jsx';
import LoadingBar from './LoadingBar.jsx';

const PERIODS = ['All', 'Medieval', 'Renaissance', 'Baroque & Romantic', 'Impressionism', 'Modern'];
const SORTS = {
  curated: { label: "Curator's picks", compare: null },
  newest: { label: 'Newest first', compare: (a, b) => (b.year ?? 0) - (a.year ?? 0) },
  oldest: { label: 'Oldest first', compare: (a, b) => (a.year ?? 0) - (b.year ?? 0) },
  title: { label: 'Title A–Z', compare: (a, b) => a.title.localeCompare(b.title) },
};

export default function CollectionGallery({ artworks, loadedCount, onImageLoad, onSelect }) {
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('All');
  const [sort, setSort] = useState('curated');

  const ranked = rankByCuratorScore(artworks);
  const q = query.trim().toLowerCase();
  const visible = ranked.filter((a) =>
    (period === 'All' || a.period === period) &&
    (!q || `${a.title} ${a.artist} ${a.medium} ${a.origin}`.toLowerCase().includes(q)),
  );
  if (SORTS[sort].compare) visible.sort(SORTS[sort].compare);

  return (
    <section className="section" id="collection" aria-labelledby="collection-title">
      <div className="section-head">
        <h2 id="collection-title">From the collection</h2>
        <p className="muted">{visible.length} of {artworks.length} works</p>
      </div>

      <div className="toolbar" role="search">
        <label className="search">
          <span className="visually-hidden">Search the collection</span>
          <input
            type="search"
            placeholder="Search by title, artist, medium…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="chips" role="group" aria-label="Filter by period">
          {PERIODS.map((p) => (
            <button key={p} className={p === period ? 'chip active' : 'chip'} aria-pressed={p === period} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
        <label className="sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
      </div>

      <LoadingBar loaded={loadedCount} total={artworks.length} />

      {visible.length === 0 && artworks.length > 0 && <p className="empty">No works match your search.</p>}
      <ul className="art-grid">
        {visible.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onLoad={onImageLoad}
            onSelect={() => onSelect(artwork.id)}
          />
        ))}
      </ul>
    </section>
  );
}
