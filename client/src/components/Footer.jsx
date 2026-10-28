export default function Footer() {
  return (
    <footer className="site-footer" id="membership">
      <div>
        <p className="brand-name">Meridian <em>Museum of Art</em></p>
        <p className="muted">111 Harbour Street · Open daily 10:00 – 17:00</p>
      </div>
      <nav aria-label="Footer">
        <a href="#visit">Plan your visit</a>
        <a href="#membership">Become a member</a>
        <a href="#collection">Collection</a>
        <a href="#top">Back to top ↑</a>
      </nav>
      <p className="muted small">A demo site. Artwork images are public domain or generated placeholders.</p>
    </footer>
  );
}
