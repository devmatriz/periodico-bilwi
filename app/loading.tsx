export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-shell">
        <div className="loading-topbar">
          <div className="loading-topbar-inner">
            <div className="loading-brand">
              <div className="loading-bar" style={{ width: 180 }} />
              <div className="loading-line short" />
            </div>
            <div className="loading-pill" />
          </div>
        </div>

        <div className="loading-grid">
          <section className="loading-hero">
            <div className="loading-panel">
              <div className="loading-line" style={{ width: 160 }} />
              <div className="loading-line title" />
              <div className="loading-line subtitle" />
              <div className="loading-line subtitle" style={{ width: "78%" }} />
              <div className="loading-actions">
                <div className="loading-pill" />
                <div className="loading-pill" />
              </div>
            </div>

            <aside className="loading-hero-side">
              <div className="loading-box" />
              <div className="loading-box" />
            </aside>
          </section>

          <section className="loading-card">
            <div className="loading-card-grid">
              <div>
                <div className="loading-line" style={{ width: 120 }} />
                <div className="loading-box" />
              </div>
              <div>
                <div className="loading-line" style={{ width: 120 }} />
                <div className="loading-box" />
              </div>
              <div>
                <div className="loading-line" style={{ width: 120 }} />
                <div className="loading-box" />
              </div>
              <div>
                <div className="loading-line" style={{ width: 120 }} />
                <div className="loading-box" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
