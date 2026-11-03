export default function Loading() {
  return (
    <div className="skeleton-page" role="status" aria-label="Cargando panel">
      <span className="sk sk--line" style={{ width: 240, height: 32 }} />
      <span className="sk sk--block" style={{ height: 92, marginTop: 20 }} />
      <div className="skeleton-rows">
        {[0, 1, 2, 3, 4].map((item) => (
          <span key={item} className="sk sk--line" style={{ height: 44 }} />
        ))}
      </div>
    </div>
  );
}
