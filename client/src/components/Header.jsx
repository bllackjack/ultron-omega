import { useState } from 'react';

const LINKS = [
  { href: '#visit', label: 'Visit' },
  { href: '#exhibitions', label: 'Exhibitions' },
  { href: '#collection', label: 'Collection' },
  { href: '#membership', label: 'Membership' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Meridian Museum of Art, home">
        <span className="brand-mark" aria-hidden="true">M</span>
        <span className="brand-name">Meridian <em>Museum of Art</em></span>
      </a>
      <button
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((o) => !o)}
      >
        Menu
      </button>
      <nav id="site-nav" className={open ? 'site-nav open' : 'site-nav'} aria-label="Primary">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a className="btn btn-primary" href="#visit">Buy tickets</a>
      </nav>
    </header>
  );
}
