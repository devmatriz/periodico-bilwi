import { NextResponse } from "next/server";
import { getPanelUser, rejectUnlessAdmin } from "@/lib/admin-guard";
import { deleteEditorialUser, updateEditorialUser, UserRuleError } from "@/lib/user-store";
import type { UserPatch } from "@/lib/user-store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    email: string;
  }>;
};

function ruleError(error: unknown) {
  if (error instanceof UserRuleError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  throw error;
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { email } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Cuerpo de solicitud invalido." }, { status: 400 });
  }

  // Solo los campos que el panel puede cambiar; nada de contraseñas por aquí.
  const patch: UserPatch = {};
  for (const key of ["name", "role", "scope", "status"] as const) {
    if (typeof body[key] === "string") patch[key] = body[key] as string;
  }
  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.isAdmin === "boolean") patch.isAdmin = body.isAdmin;

  const me = await getPanelUser();
  if (me && me.email === decodeURIComponent(email).toLowerCase() && (patch.active === false || patch.isAdmin === false)) {
    return NextResponse.json({ message: "No puedes quitarte el acceso a ti mismo." }, { status: 400 });
  }

  try {
    const item = await updateEditorialUser(email, patch);
    if (!item) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ item, message: "Usuario actualizado correctamente." });
  } catch (error) {
    return ruleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { email } = await context.params;
  const me = await getPanelUser();
  if (me && me.email === decodeURIComponent(email).toLowerCase()) {
    return NextResponse.json({ message: "No puedes borrar tu propia cuenta." }, { status: 400 });
  }

  try {
    const removed = await deleteEditorialUser(email);
    if (!removed) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ message: "Cuenta eliminada." });
  } catch (error) {
    return ruleError(error);
  }
}
