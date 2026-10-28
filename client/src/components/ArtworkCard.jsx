export default function ArtworkCard({ artwork, onLoad, onSelect }) {
  return (
    <li className="art-card">
      <button className="art-card-button" onClick={onSelect} aria-label={`View ${artwork.title} by ${artwork.artist}`}>
        <div className="art-frame">
          <img src={artwork.full} alt={artwork.title} onLoad={onLoad} />
        </div>
        <div className="art-caption">
          <h3>{artwork.title}</h3>
          <p>{artwork.artist}{artwork.date ? `, ${artwork.date}` : ''}</p>
        </div>
      </button>
    </li>
  );
}
