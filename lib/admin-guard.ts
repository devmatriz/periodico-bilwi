import "server-only";

import { cache } from "react";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveUserByEmail } from "@/lib/user-store";

/**
 * Persona del panel para esta petición. La sesión solo dice quién es; el permiso se lee de la base
 * en cada petición, así una cuenta desactivada o sin permiso de administración pierde el acceso al instante.
 */
export const getPanelUser = cache(async () => {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return getActiveUserByEmail(email);
});

/** Cualquier persona del equipo con cuenta activa. */
export async function isStaff() {
  return Boolean(await getPanelUser());
}

/** Solo cuentas de administración (crean cuentas y cambian las secciones). */
export async function isAdmin() {
  return Boolean((await getPanelUser())?.isAdmin);
}

/**
 * Para páginas de /admin. El layout también verifica la sesión, pero Next renderiza
 * layout y página en paralelo: cada página debe cortar antes de leer datos.
 * Quien entra con una contraseña temporal va primero a "Mi cuenta" a cambiarla.
 */
export async function requireStaffPage(callbackUrl = "/admin", options?: { allowPendingPassword?: boolean }) {
  const user = await getPanelUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (user.mustChangePassword && !options?.allowPendingPassword) {
    redirect("/admin/cuenta");
  }
  return user;
}

export async function requireAdminPage(callbackUrl = "/admin") {
  const user = await requireStaffPage(callbackUrl);
  if (!user.isAdmin) {
    redirect("/admin");
  }
  return user;
}

/** Para rutas API: devuelve la respuesta a enviar si no hay acceso, o null si puede continuar. */
export async function rejectUnlessStaff() {
  if (await isStaff()) {
    return null;
  }

  return NextResponse.json({ message: "Necesitas iniciar sesión en el panel." }, { status: 401 });
}

export async function rejectUnlessAdmin() {
  const user = await getPanelUser();
  if (user?.isAdmin) {
    return null;
  }

  return user
    ? NextResponse.json({ message: "Solo una cuenta de administración puede hacer esto." }, { status: 403 })
    : NextResponse.json({ message: "Necesitas iniciar sesión como administrador." }, { status: 401 });
}
