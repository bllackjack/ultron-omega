import { useEffect, useState } from 'react';

// Hide the bar once images stop arriving, e.g. when the rest of the
// collection hasn't been requested yet because it's below the fold.
const IDLE_MS = 1500;

export default function LoadingBar({ loaded, total }) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    setIdle(false);
    const timer = setTimeout(() => setIdle(true), IDLE_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  if (!total || loaded >= total || idle) return null;
  const pct = Math.round((loaded / total) * 100);
  return (
    <div className="loading-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Loading collection images">
      <div className="loading-bar-fill" style={{ width: `${pct}%` }} />
      <span>Loading collection… {loaded} / {total}</span>
    </div>
  );
}
