import Link from "next/link";

type NavItem = { href: string; label: string; path: string };

/** Menú de secciones. `current` es la dirección actual sin prefijo de idioma. */
export function SectionNav({ items, current, label }: { items: NavItem[]; current: string; label: string }) {
  const path = current.split("?")[0] || "/";

  return (
    <nav className="section-nav" aria-label={label}>
      <ul>
        {items.map((item) => {
          const active = item.path === "/" ? path === "/" : path === item.path || path.startsWith(`${item.path}/`);
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
