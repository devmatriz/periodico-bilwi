export default function Loading() {
  return (
    <div className="skeleton-page wrap page" role="status" aria-label="Cargando noticias">
      <span className="sk sk--line" style={{ width: "40%", height: 40 }} />
      <span className="sk sk--line" style={{ width: "30%" }} />
      <span className="sk sk--block" style={{ height: 76, marginTop: 24 }} />
      <div className="skeleton-rows">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="skeleton-row">
            <span className="sk sk--thumb" />
            <div>
              <span className="sk sk--line" style={{ width: "90%", height: 20 }} />
              <span className="sk sk--line" style={{ width: "70%" }} />
              <span className="sk sk--line" style={{ width: "30%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
