"use client";

import { useEffect, useMemo, useState } from "react";

type LiveTickerProps = {
  items: string[];
  labels: { label: string; updatedAt: string; fallback: string };
  /** Configuración regional para la hora (es-NI, en-US…). */
  intl: string;
};

function formatStamp(intl: string) {
  return new Intl.DateTimeFormat(intl, {
    timeZone: "America/Managua",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function LiveTicker({ items, labels, intl }: LiveTickerProps) {
  const [offset, setOffset] = useState(0);
  const [stamp, setStamp] = useState<string | null>(null);
  const safeItems = useMemo(
    () =>
      items.length > 0 ? items : [labels.fallback],
    [items, labels.fallback],
  );

  useEffect(() => {
    setStamp(formatStamp(intl));

    const rotate = window.setInterval(() => {
      setOffset((current) => (current + 1) % safeItems.length);
    }, 12000);

    const refresh = window.setInterval(() => {
      setStamp(formatStamp(intl));
    }, 60000);

    return () => {
      window.clearInterval(rotate);
      window.clearInterval(refresh);
    };
  }, [safeItems.length, intl]);

  const flowItems = useMemo(() => {
    const rotated = [...safeItems.slice(offset), ...safeItems.slice(0, offset)];
    return [...rotated, ...rotated];
  }, [safeItems, offset]);

  return (
    <div className="ticker" role="region" aria-label={labels.label}>
      <div className="wrap ticker-inner">
        <span className="ticker-label">{labels.label}</span>
        <div className="ticker-track">
          <ul className="ticker-marquee">
            {flowItems.map((item, index) => (
              <li className="ticker-item" key={`${item}-${index}`} aria-hidden={index >= safeItems.length ? true : undefined}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {stamp ? (
          <span className="ticker-stamp">
            <span className="visually-hidden">{labels.updatedAt}</span>
            {stamp}
          </span>
        ) : null}
      </div>
    </div>
  );
}
