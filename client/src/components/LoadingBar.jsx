export default function LoadingBar({ loaded, total }) {
  if (!total || loaded >= total) return null;
  const pct = Math.round((loaded / total) * 100);
  return (
    <div className="loading-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Loading collection images">
      <div className="loading-bar-fill" style={{ width: `${pct}%` }} />
      <span>Loading collection… {loaded} / {total}</span>
    </div>
  );
}
