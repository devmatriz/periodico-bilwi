import "server-only";

import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSeedAdminCredentials } from "@/lib/production-env";

export type AdminCredentialRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordSalt: string;
  passwordHash: string;
  active: boolean;
};

const dataDir = path.join(process.cwd(), "data");
const authFile = path.join(dataDir, "admin-auth.json");

let authRecordsCache: AdminCredentialRecord[] | null = null;

function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
}

// La primera cuenta sale de ADMIN_EMAIL / ADMIN_PASSWORD (obligatorias en producción).
function createSeedRecord(): AdminCredentialRecord {
  const { email, password } = getSeedAdminCredentials();
  const passwordSalt = randomBytes(16).toString("hex");

  return {
    id: "admin-bilwi",
    name: "Administrador Bilwi",
    email,
    role: "admin",
    passwordSalt,
    passwordHash: hashPassword(password, passwordSalt),
    active: true,
  };
}

async function readJsonFile<T>(file: string, fallback: T) {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(file: string, value: T) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readAuthRecords() {
  if (authRecordsCache) {
    return authRecordsCache;
  }

  const stored = await readJsonFile<AdminCredentialRecord[] | null>(authFile, null);

  if (!Array.isArray(stored) || stored.length === 0) {
    const fallback = [createSeedRecord()];
    await writeJsonFile(authFile, fallback);
    authRecordsCache = fallback;
    return fallback;
  }

  // Una cuenta sin contraseña guardada queda desactivada: nunca hereda la contraseña inicial.
  const normalized = stored.map((record) => {
    const hasPassword = Boolean(record.passwordSalt && record.passwordHash);
    return {
      ...record,
      id: record.id || "admin-bilwi",
      name: record.name || "Administrador Bilwi",
      email: (record.email || "").trim().toLowerCase(),
      role: record.role || "admin",
      passwordSalt: record.passwordSalt || "",
      passwordHash: record.passwordHash || "",
      active: hasPassword && (typeof record.active === "boolean" ? record.active : true),
    };
  });

  const shouldPersist = JSON.stringify(normalized) !== JSON.stringify(stored);
  if (shouldPersist) {
    await writeJsonFile(authFile, normalized);
  }

  authRecordsCache = normalized;
  return normalized;
}

export async function getAdminAuthRecords() {
  return readAuthRecords();
}

export async function validateAdminCredentials(email: string | undefined, password: string | undefined) {
  if (!email || !password) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const records = await readAuthRecords();
  const account = records.find((record) => record.email === normalizedEmail);

  if (!account || !account.active) {
    return null;
  }

  const candidateHash = hashPassword(password, account.passwordSalt);
  const storedHash = Buffer.from(account.passwordHash, "hex");
  const givenHash = Buffer.from(candidateHash, "hex");

  if (storedHash.length !== givenHash.length) {
    return null;
  }

  if (!timingSafeEqual(storedHash, givenHash)) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role || "admin",
  };
}
