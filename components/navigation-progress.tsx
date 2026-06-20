"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const hideTimer = window.setTimeout(() => setVisible(false), 600);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [pathname]);

  return <div className={`route-progress${visible ? " route-progress--visible" : ""}`} aria-hidden="true" />;
}
