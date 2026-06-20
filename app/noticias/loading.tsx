export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-shell">
        <div className="loading-panel">
          <div className="loading-line" style={{ width: 120 }} />
          <div className="loading-line title" style={{ width: "58%" }} />
          <div className="loading-line subtitle" />
          <div className="loading-line subtitle" style={{ width: "72%" }} />
        </div>

        <div className="loading-card">
          <div className="loading-card-grid" style={{ gridTemplateColumns: "1.15fr 1fr 0.9fr" }}>
            <div className="loading-panel">
              <div className="loading-line" style={{ width: 110 }} />
              <div className="loading-box" style={{ height: 220 }} />
            </div>
            <div className="loading-panel">
              <div className="loading-line" style={{ width: 110 }} />
              <div className="loading-box" style={{ height: 220 }} />
            </div>
            <div className="loading-panel">
              <div className="loading-line" style={{ width: 110 }} />
              <div className="loading-box" style={{ height: 220 }} />
            </div>
          </div>
        </div>

        <div className="loading-table">
          <div className="loading-table-row" />
          <div className="loading-table-row" />
          <div className="loading-table-row" />
          <div className="loading-table-row" />
        </div>
      </div>
    </div>
  );
}
