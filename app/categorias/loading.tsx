export default function Loading() {
  return (
    <div className="skeleton-page wrap page" role="status" aria-label="Cargando secciones">
      <span className="sk sk--line" style={{ width: "30%", height: 40 }} />
      <span className="sk sk--line" style={{ width: "45%" }} />
      <div className="skeleton-rows">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <span key={item} className="sk sk--block" style={{ height: 96 }} />
        ))}
      </div>
    </div>
  );
}
