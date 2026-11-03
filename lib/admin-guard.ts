import "server-only";

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

/**
 * Para páginas de /admin. El layout también verifica la sesión, pero Next renderiza
 * layout y página en paralelo: cada página debe cortar antes de leer datos.
 */
export async function requireAdminPage(callbackUrl = "/admin") {
  if (!(await isAdmin())) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
}

/** Para rutas API: devuelve la respuesta 401 a enviar, o null si hay sesión de administrador. */
export async function rejectUnlessAdmin() {
  if (await isAdmin()) {
    return null;
  }

  return NextResponse.json({ message: "Necesitas iniciar sesión como administrador." }, { status: 401 });
}
