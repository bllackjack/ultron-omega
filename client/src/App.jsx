import { useEffect, useState } from 'react';
import { fetchArtworks, fetchExhibitions } from './api.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Exhibitions from './components/Exhibitions.jsx';
import CollectionGallery from './components/CollectionGallery.jsx';
import ArtworkModal from './components/ArtworkModal.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [artworks, setArtworks] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [error, setError] = useState(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    Promise.all([fetchArtworks(), fetchExhibitions()])
      .then(([art, ex]) => {
        setArtworks(art);
        setExhibitions(ex);
      })
      .catch((err) => setError(err.message));
  }, []);

  const current = exhibitions.find((ex) => ex.status === 'current');
  const upcoming = exhibitions.filter((ex) => ex.status === 'upcoming');

  return (
    <>
      <Header />
      <main>
        <Hero exhibition={current} />
        <Exhibitions items={upcoming} />
        {error ? (
          <p className="error" role="alert">Sorry, the collection could not be loaded. {error}</p>
        ) : (
          <CollectionGallery
            artworks={artworks}
            loadedCount={loadedCount}
            onImageLoad={() => setLoadedCount((c) => c + 1)}
            onSelect={setSelectedId}
          />
        )}
      </main>
      <Footer />
      {selectedId != null && (
        <ArtworkModal
          artworks={artworks}
          selectedId={selectedId}
          onNavigate={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
