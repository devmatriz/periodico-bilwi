export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-shell" style={{ maxWidth: 1120 }}>
        <div className="loading-panel">
          <div className="loading-line" style={{ width: 96 }} />
          <div className="loading-line title" style={{ width: "65%" }} />
          <div className="loading-line subtitle" />
          <div className="loading-line subtitle" style={{ width: "84%" }} />
        </div>

        <div className="loading-hero">
          <div className="loading-panel">
            <div className="loading-box" style={{ height: 460 }} />
          </div>
          <aside className="loading-grid">
            <div className="loading-panel">
              <div className="loading-line" style={{ width: 120 }} />
              <div className="loading-box" style={{ height: 120 }} />
            </div>
            <div className="loading-panel">
              <div className="loading-line" style={{ width: 120 }} />
              <div className="loading-box" style={{ height: 120 }} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
