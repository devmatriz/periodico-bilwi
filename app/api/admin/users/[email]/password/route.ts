import { NextResponse } from "next/server";
import { rejectUnlessAdmin } from "@/lib/admin-guard";
import { resetUserPassword, UserRuleError } from "@/lib/user-store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    email: string;
  }>;
};

/** Pone una contraseña temporal; la persona tendrá que cambiarla al entrar. */
export async function POST(request: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { email } = await context.params;
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;

  try {
    const item = await resetUserPassword(email, String(body?.password ?? ""));
    if (!item) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ item, message: "Contraseña temporal guardada." });
  } catch (error) {
    if (error instanceof UserRuleError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
}
