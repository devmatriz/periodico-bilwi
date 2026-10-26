"use client";

import { signOut } from "next-auth/react";
import { IconLogOut } from "@/components/icons";

export function AdminLogoutButton() {
  return (
    <button
      className="icon-button admin-logout"
      type="button"
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      onClick={() => void signOut({ callbackUrl: "/login" })}
    >
      <IconLogOut size={18} />
    </button>
  );
}
