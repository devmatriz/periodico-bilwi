export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-shell" style={{ gridTemplateColumns: "286px minmax(0, 1fr)", display: "grid" }}>
        <aside className="loading-panel" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="loading-line" style={{ width: 160, marginBottom: 18 }} />
          <div className="loading-line" style={{ width: "90%", marginBottom: 14 }} />
          <div className="loading-box" style={{ height: 150, marginBottom: 16 }} />
          <div className="loading-table">
            <div className="loading-table-row" />
            <div className="loading-table-row" />
            <div className="loading-table-row" />
            <div className="loading-table-row" />
          </div>
        </aside>

        <main className="loading-grid">
          <section className="loading-panel">
            <div className="loading-line" style={{ width: 140 }} />
            <div className="loading-line title" style={{ width: "72%" }} />
            <div className="loading-line subtitle" />
            <div className="loading-actions">
              <div className="loading-pill" />
              <div className="loading-pill" />
            </div>
          </section>
          <section className="loading-card-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            <div className="loading-card"><div className="loading-line" /><div className="loading-box" /></div>
            <div className="loading-card"><div className="loading-line" /><div className="loading-box" /></div>
            <div className="loading-card"><div className="loading-line" /><div className="loading-box" /></div>
            <div className="loading-card"><div className="loading-line" /><div className="loading-box" /></div>
          </section>
          <section className="loading-hero">
            <div className="loading-panel">
              <div className="loading-line" style={{ width: 120 }} />
              <div className="loading-box" style={{ height: 260 }} />
            </div>
            <aside className="loading-hero-side">
              <div className="loading-box" />
              <div className="loading-box" />
              <div className="loading-box" />
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
