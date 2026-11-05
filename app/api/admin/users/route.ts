import { NextResponse } from "next/server";
import { rejectUnlessAdmin } from "@/lib/admin-guard";
import { createEditorialUser, UserRuleError } from "@/lib/user-store";

export const runtime = "nodejs";

/** Crea una cuenta del equipo con una contraseña temporal. */
export async function POST(request: Request) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: "Cuerpo de solicitud invalido." }, { status: 400 });
  }

  try {
    const item = await createEditorialUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      role: typeof body.role === "string" ? body.role : undefined,
      scope: typeof body.scope === "string" ? body.scope : undefined,
      isAdmin: body.isAdmin === true,
      password: String(body.password ?? ""),
    });
    return NextResponse.json({ item, message: "Cuenta creada." }, { status: 201 });
  } catch (error) {
    if (error instanceof UserRuleError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
}
