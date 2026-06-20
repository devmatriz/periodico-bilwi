"use client";

import { useEffect, useMemo, useState } from "react";

type LiveTickerProps = {
  items: string[];
};

function formatStamp() {
  return new Intl.DateTimeFormat("es-NI", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function LiveTicker({ items }: LiveTickerProps) {
  const [offset, setOffset] = useState(0);
  const [stamp, setStamp] = useState(() => formatStamp());
  const safeItems = items.length > 0 ? items : ["Bilwi Noticias se actualiza minuto a minuto"];

  useEffect(() => {
    if (safeItems.length === 0) {
      return;
    }

    const rotate = window.setInterval(() => {
      setOffset((current) => (current + 1) % safeItems.length);
    }, 12000);

    const refresh = window.setInterval(() => {
      setStamp(formatStamp());
    }, 60000);

    return () => {
      window.clearInterval(rotate);
      window.clearInterval(refresh);
    };
  }, [safeItems.length]);

  const flowItems = useMemo(() => {
    const rotated = [...safeItems.slice(offset), ...safeItems.slice(0, offset)];
    return [...rotated, ...rotated];
  }, [safeItems, offset]);

  return (
    <div className="ticker-bar" role="status" aria-live="polite">
      <span className="ticker-label">ULTIMO MINUTO</span>
      <div className="ticker-track">
        <div className="ticker-marquee">
          {flowItems.map((item, index) => (
            <span className="ticker-item" key={`${item}-${index}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
      <span className="ticker-live">
        Minuto a minuto
        <strong>{stamp}</strong>
      </span>
    </div>
  );
}
