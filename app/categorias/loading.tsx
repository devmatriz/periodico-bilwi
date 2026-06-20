export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-shell">
        <div className="loading-panel">
          <div className="loading-line" style={{ width: 120 }} />
          <div className="loading-line title" style={{ width: "48%" }} />
          <div className="loading-line subtitle" />
          <div className="loading-line subtitle" style={{ width: "62%" }} />
        </div>

        <div className="loading-card-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          <div className="loading-card">
            <div className="loading-line" style={{ width: 100 }} />
            <div className="loading-box" style={{ height: 180 }} />
          </div>
          <div className="loading-card">
            <div className="loading-line" style={{ width: 100 }} />
            <div className="loading-box" style={{ height: 180 }} />
          </div>
          <div className="loading-card">
            <div className="loading-line" style={{ width: 100 }} />
            <div className="loading-box" style={{ height: 180 }} />
          </div>
          <div className="loading-card">
            <div className="loading-line" style={{ width: 100 }} />
            <div className="loading-box" style={{ height: 180 }} />
          </div>
        </div>

        <div className="loading-hero">
          <div className="loading-panel">
            <div className="loading-line" style={{ width: 120 }} />
            <div className="loading-box" style={{ height: 240 }} />
          </div>
          <aside className="loading-hero-side">
            <div className="loading-box" />
            <div className="loading-box" />
            <div className="loading-box" />
          </aside>
        </div>
      </div>
    </div>
  );
}
