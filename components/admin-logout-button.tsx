"use client";

import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button
      className="button button-secondary"
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
    >
      Cerrar sesion
    </button>
  );
}

