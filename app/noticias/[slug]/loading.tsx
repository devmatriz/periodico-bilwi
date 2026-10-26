export default function Loading() {
  return (
    <div className="skeleton-page wrap page skeleton-article" role="status" aria-label="Cargando noticia">
      <span className="sk sk--line" style={{ width: 160 }} />
      <span className="sk sk--line" style={{ width: "92%", height: 44 }} />
      <span className="sk sk--line" style={{ width: "70%", height: 44 }} />
      <span className="sk sk--line" style={{ width: "50%", marginTop: 12 }} />
      <span className="sk sk--media" style={{ marginTop: 24 }} />
      {[0, 1, 2, 3, 4].map((item) => (
        <span key={item} className="sk sk--line" style={{ width: item === 4 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}
