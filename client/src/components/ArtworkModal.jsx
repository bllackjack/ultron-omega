import { useEffect, useRef } from 'react';

export default function ArtworkModal({ artworks, selectedId, onNavigate, onClose }) {
  const dialogRef = useRef(null);
  const index = artworks.findIndex((a) => a.id === selectedId);
  const artwork = artworks[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') onNavigate(artworks[(index + 1) % artworks.length].id);
      if (e.key === 'ArrowLeft') onNavigate(artworks[(index - 1 + artworks.length) % artworks.length].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [artworks, index, onNavigate]);

  if (!artwork) return null;

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
    >
      <div className="modal-inner">
        <div className="modal-media">
          <img src={artwork.full} alt={artwork.title} />
        </div>
        <div className="modal-body">
          <button className="modal-close" onClick={() => dialogRef.current.close()} aria-label="Close">×</button>
          <p className="eyebrow">{artwork.period}</p>
          <h2 id="modal-title">{artwork.title}</h2>
          <p className="modal-artist">{artwork.artist}</p>
          <dl className="facts">
            {artwork.date && <><dt>Date</dt><dd>{artwork.date}</dd></>}
            {artwork.medium && <><dt>Medium</dt><dd>{artwork.medium}</dd></>}
            {artwork.origin && <><dt>Origin</dt><dd>{artwork.origin}</dd></>}
            <dt>Credit</dt><dd>{artwork.credit}</dd>
          </dl>
          {artwork.description && <p className="muted">{artwork.description}</p>}
          <div className="palette" aria-label="Dominant colours">
            {artwork.palette.map(([r, g, b], i) => <span key={i} style={{ background: `rgb(${r} ${g} ${b})` }} />)}
          </div>
          <div className="modal-nav">
            <button className="btn btn-ghost" onClick={() => onNavigate(artworks[(index - 1 + artworks.length) % artworks.length].id)}>← Previous</button>
            <button className="btn btn-ghost" onClick={() => onNavigate(artworks[(index + 1) % artworks.length].id)}>Next →</button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
