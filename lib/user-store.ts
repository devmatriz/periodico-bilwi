import "server-only";

import { pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSeedAdminCredentials } from "@/lib/production-env";

/** Persona del equipo tal como la ve el panel (nunca incluye la contraseña). */
export type EditorialUserSetting = {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  status: string;
  active: boolean;
  isAdmin: boolean;
  hasPassword: boolean;
  mustChangePassword: boolean;
  lastSeen: string;
};

export type NewUserInput = {
  name: string;
  email: string;
  role?: string;
  scope?: string;
  isAdmin?: boolean;
  password: string;
};

export type UserPatch = Partial<Pick<EditorialUserSetting, "name" | "role" | "scope" | "status" | "active" | "isAdmin">>;

export const MIN_PASSWORD_LENGTH = 12;

/** Error con un mensaje pensado para mostrarse tal cual en el panel. */
export class UserRuleError extends Error {}

export function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
}

function newPasswordFields(password: string) {
  const passwordSalt = randomBytes(16).toString("hex");
  return { passwordSalt, passwordHash: hashPassword(password, passwordSalt) };
}

function passwordMatches(user: Pick<User, "passwordSalt" | "passwordHash">, password: string) {
  if (!user.passwordSalt || !user.passwordHash) return false;
  const stored = Buffer.from(user.passwordHash, "hex");
  const given = Buffer.from(hashPassword(password, user.passwordSalt), "hex");
  return stored.length === given.length && timingSafeEqual(stored, given);
}

function assertPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new UserRuleError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function lastSeenLabel(date: Date | null) {
  if (!date) return "Nunca";
  return new Intl.DateTimeFormat("es-NI", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Managua" }).format(date);
}

function toSetting(user: User): EditorialUserSetting {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    scope: user.scope,
    status: user.active ? user.status : "Inactivo",
    active: user.active,
    isAdmin: user.isAdmin,
    hasPassword: Boolean(user.passwordHash),
    mustChangePassword: user.mustChangePassword,
    lastSeen: lastSeenLabel(user.lastLoginAt),
  };
}

/** Con la base vacía, crea la primera cuenta de administración desde ADMIN_EMAIL / ADMIN_PASSWORD. */
async function ensureFirstAdmin() {
  if ((await prisma.user.count()) > 0) return;

  const { email, password } = getSeedAdminCredentials();
  await prisma.user.create({
    data: {
      id: randomUUID(),
      name: "Administrador Bilwi",
      email,
      role: "Editor en Jefe",
      scope: "Publicación general",
      isAdmin: true,
      ...newPasswordFields(password),
    },
  });
}

/** Comprueba correo y contraseña al iniciar sesión. Devuelve null si no coinciden o la cuenta está desactivada. */
export async function validateAdminCredentials(email: string | undefined, password: string | undefined) {
  if (!email || !password) {
    return null;
  }

  await ensureFirstAdmin();
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });

  if (!user || !user.active || !passwordMatches(user, password)) {
    return null;
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.isAdmin ? "admin" : "editor",
  };
}

/** Cuenta activa con contraseña para el correo de la sesión; null si ya no puede entrar al panel. */
export async function getActiveUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user || !user.active || !user.passwordHash) return null;
  return toSetting(user);
}

export async function getEditorialUsers() {
  const users = await prisma.user.findMany({ orderBy: [{ isAdmin: "desc" }, { createdAt: "asc" }] });
  return users.map(toSetting);
}

/** Impide dejar el periódico sin ninguna cuenta de administración activa. */
async function assertKeepsAnAdmin(userId: string, next: { active: boolean; isAdmin: boolean }) {
  if (next.active && next.isAdmin) return;
  const others = await prisma.user.count({ where: { isAdmin: true, active: true, id: { not: userId } } });
  if (others === 0) {
    throw new UserRuleError("Debe quedar al menos una cuenta de administración activa.");
  }
}

export async function createEditorialUser(input: NewUserInput) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (!name) throw new UserRuleError("Escribe el nombre de la persona.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserRuleError("El correo no es válido.");
  assertPassword(input.password);

  if (await prisma.user.findUnique({ where: { email } })) {
    throw new UserRuleError("Ya existe una cuenta con ese correo.");
  }

  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      name,
      email,
      role: input.role?.trim() || "Redacción",
      scope: input.scope?.trim() || "",
      isAdmin: Boolean(input.isAdmin),
      // La contraseña la eligió quien creó la cuenta: la persona debe cambiarla al entrar.
      mustChangePassword: true,
      ...newPasswordFields(input.password),
    },
  });

  return toSetting(user);
}

export async function updateEditorialUser(email: string, patch: UserPatch) {
  const current = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });

  if (!current) {
    return null;
  }

  const active = typeof patch.active === "boolean" ? patch.active : current.active;
  const isAdmin = typeof patch.isAdmin === "boolean" ? patch.isAdmin : current.isAdmin;
  await assertKeepsAnAdmin(current.id, { active, isAdmin });

  let status = patch.status?.trim() || current.status;
  if (typeof patch.active === "boolean" && patch.status === undefined) {
    status = patch.active ? (current.status === "Inactivo" ? "Activo" : current.status) : "Inactivo";
  }

  const user = await prisma.user.update({
    where: { id: current.id },
    data: {
      name: patch.name?.trim() || current.name,
      role: patch.role?.trim() || current.role,
      scope: patch.scope !== undefined ? patch.scope.trim() : current.scope,
      status,
      active,
      isAdmin,
    },
  });

  return toSetting(user);
}

export async function toggleEditorialUser(email: string, active: boolean) {
  return updateEditorialUser(email, { active });
}

/** Una persona de administración pone una contraseña temporal; la otra persona la cambia al entrar. */
export async function resetUserPassword(email: string, password: string) {
  assertPassword(password);
  const current = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!current) return null;

  const user = await prisma.user.update({
    where: { id: current.id },
    data: { ...newPasswordFields(password), mustChangePassword: true },
  });
  return toSetting(user);
}

/** Cada persona cambia su propia contraseña desde "Mi cuenta". */
export async function changeOwnPassword(email: string, currentPassword: string, nextPassword: string) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });

  if (!user || !user.active || !passwordMatches(user, currentPassword)) {
    throw new UserRuleError("La contraseña actual no es correcta.");
  }
  assertPassword(nextPassword);
  if (currentPassword === nextPassword) {
    throw new UserRuleError("La contraseña nueva debe ser distinta de la actual.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { ...newPasswordFields(nextPassword), mustChangePassword: false },
  });
}

export async function deleteEditorialUser(email: string) {
  const current = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!current) return false;

  await assertKeepsAnAdmin(current.id, { active: false, isAdmin: false });
  await prisma.user.delete({ where: { id: current.id } });
  return true;
}
