"use client";

import { useEffect, useMemo, useState } from "react";
import { displayCategory } from "@/lib/sections";

type LiveTickerProps = {
  items: string[];
};

function formatStamp() {
  return new Intl.DateTimeFormat("es-NI", {
    timeZone: "America/Managua",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function LiveTicker({ items }: LiveTickerProps) {
  const [offset, setOffset] = useState(0);
  const [stamp, setStamp] = useState<string | null>(null);
  const safeItems = useMemo(
    () =>
      (items.length > 0 ? items : ["Bilwi Noticias se actualiza minuto a minuto"]).map((item) => {
        const [category, ...rest] = item.split(": ");
        return rest.length > 0 ? `${displayCategory(category)}: ${rest.join(": ")}` : item;
      }),
    [items],
  );

  useEffect(() => {
    setStamp(formatStamp());

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
    <div className="ticker" role="region" aria-label="Último minuto">
      <div className="wrap ticker-inner">
        <span className="ticker-label">Último minuto</span>
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
            <span className="visually-hidden">Actualizado a las </span>
            {stamp}
          </span>
        ) : null}
      </div>
    </div>
  );
}
