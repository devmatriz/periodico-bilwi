import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { splitLocalePath } from "@/lib/i18n";

// Las direcciones /en/… muestran las mismas páginas que las de siempre, en inglés.
// El idioma y la dirección original viajan en cabeceras para que las páginas los lean.
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { locale, path } = splitLocalePath(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-pathname", `${path}${search}`);

  if (path !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Fuera: panel, APIs, archivos estáticos, subidas e íconos.
  matcher: [
    "/((?!admin|api|_next|uploads/|marca/|icon|apple-icon|opengraph-image|twitter-image|manifest|favicon|robots|sitemap).*)",
  ],
};
