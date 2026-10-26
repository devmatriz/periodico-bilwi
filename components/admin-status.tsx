import type { NewsStatus } from "@/lib/content-store";

export const statusLabels: Record<NewsStatus, string> = {
  published: "Publicada",
  draft: "Borrador",
  scheduled: "Programada",
  archived: "Archivada",
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`status status--${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {label ?? statusLabels[status as NewsStatus] ?? status}
    </span>
  );
}
