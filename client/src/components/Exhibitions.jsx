import { formatRange } from '../lib/format.js';

export default function Exhibitions({ items }) {
  return (
    <section className="section" id="exhibitions" aria-labelledby="exhibitions-title">
      <div className="section-head">
        <h2 id="exhibitions-title">Coming soon</h2>
        <a href="#exhibitions" className="link-arrow">All exhibitions</a>
      </div>
      <ul className="exhibition-list">
        {items.map((ex) => (
          <li key={ex.slug} className="exhibition-card">
            <img src={ex.artwork.thumb} alt="" loading="lazy" />
            <div className="exhibition-body">
              <p className="eyebrow">{formatRange(ex.start, ex.end)}</p>
              <h3>{ex.title}</h3>
              <p>{ex.subtitle}</p>
              <p className="muted">{ex.gallery}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
