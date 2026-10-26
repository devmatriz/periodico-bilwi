import { NextResponse } from "next/server";
import { rejectUnlessAdmin } from "@/lib/admin-guard";
import { toggleEditorialUser, updateEditorialUser } from "@/lib/editorial-admin-store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    email: string;
  }>;
};

async function resolveParams(context: RouteContext) {
  return Promise.resolve(context.params);
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { email } = await resolveParams(context);
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Cuerpo de solicitud invalido." }, { status: 400 });
  }

  const normalizedBody = body as Record<string, unknown>;
  const item =
    typeof normalizedBody.active === "boolean" && Object.keys(normalizedBody).length === 1
      ? await toggleEditorialUser(email, normalizedBody.active)
      : await updateEditorialUser(
          email,
          normalizedBody as Parameters<typeof updateEditorialUser>[1],
        );

  if (!item) {
    return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ item, message: "Usuario actualizado correctamente." });
}
