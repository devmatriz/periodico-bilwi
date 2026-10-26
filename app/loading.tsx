export default function Loading() {
  return (
    <div className="skeleton-page" role="status" aria-label="Cargando portada">
      <div className="skeleton-masthead wrap">
        <span className="sk sk--line" style={{ width: 220, height: 34 }} />
        <span className="sk sk--line" style={{ width: 200 }} />
      </div>
      <div className="skeleton-board">
        <div className="wrap skeleton-board-grid">
          <div>
            <span className="sk sk--dark sk--media" />
            <span className="sk sk--dark sk--line" style={{ width: "85%", height: 28, marginTop: 18 }} />
            <span className="sk sk--dark sk--line" style={{ width: "60%", height: 28 }} />
          </div>
          <div className="skeleton-list">
            {[0, 1, 2, 3].map((item) => (
              <span key={item} className="sk sk--dark sk--line" style={{ height: 56 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
