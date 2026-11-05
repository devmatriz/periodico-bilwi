import { NextResponse } from "next/server";
import { getPanelUser } from "@/lib/admin-guard";
import { changeOwnPassword, UserRuleError } from "@/lib/user-store";

export const runtime = "nodejs";

/** Cada persona cambia su propia contraseña (también quien entra con una temporal). */
export async function POST(request: Request) {
  const me = await getPanelUser();
  if (!me) {
    return NextResponse.json({ message: "Necesitas iniciar sesión en el panel." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { currentPassword?: unknown; newPassword?: unknown } | null;

  try {
    await changeOwnPassword(me.email, String(body?.currentPassword ?? ""), String(body?.newPassword ?? ""));
    return NextResponse.json({ message: "Contraseña actualizada." });
  } catch (error) {
    if (error instanceof UserRuleError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
}
