import { formatRange } from '../lib/format.js';

export default function Hero({ exhibition }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-media">
        {exhibition && (
          <img src={exhibition.artwork.large} alt={`${exhibition.artwork.title} by ${exhibition.artwork.artist}`} />
        )}
      </div>
      <div className="hero-copy">
        <p className="eyebrow">Now on view{exhibition ? ` · ${exhibition.gallery}` : ''}</p>
        <h1 id="hero-title">{exhibition?.title ?? 'Meridian Museum of Art'}</h1>
        <p className="lede">{exhibition?.subtitle ?? 'Five thousand years of art, under one roof.'}</p>
        {exhibition && <p className="dates">{formatRange(exhibition.start, exhibition.end)}</p>}
        <div className="hero-actions">
          <a className="btn btn-primary" href="#visit">Reserve timed entry</a>
          <a className="btn btn-ghost" href="#collection">Explore the collection</a>
        </div>
        <dl className="visit-strip" id="visit">
          <div><dt>Today</dt><dd>10:00 – 17:00</dd></div>
          <div><dt>Thursdays</dt><dd>Open late until 20:00</dd></div>
          <div><dt>Admission</dt><dd>$25 · Members free</dd></div>
        </dl>
      </div>
    </section>
  );
}
