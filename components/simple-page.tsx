import { PublicShell } from "@/components/public-shell";

export function SimplePage({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <PublicShell compact>
      <div className="wrap page">
        <header className="page-head">
          <h1>{title}</h1>
          {lede ? <p className="page-lede">{lede}</p> : null}
        </header>
        {children ? <div className="prose">{children}</div> : null}
      </div>
    </PublicShell>
  );
}
