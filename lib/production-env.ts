// Valores de desarrollo que nunca deben llegar a producción.
// En producción, si falta una variable o trae un valor de ejemplo, el sitio se niega a arrancar
// en lugar de quedar abierto con una clave conocida.

const PLACEHOLDER_SECRETS = new Set(["cambia-esto-por-una-clave-segura", "bilwi-noticias-dev-secret"]);
const DEFAULT_ADMIN_PASSWORD = "Bilwi2026!";
const DEFAULT_ADMIN_EMAIL = "admin@bilwi.ni";

// `next build` también corre con NODE_ENV=production, pero ahí todavía no hay secretos que exigir.
const isProductionRuntime = process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";

function fail(message: string): never {
  throw new Error(`[BilwiNoticias] Configuración de producción incompleta: ${message}`);
}

export function getAuthSecret() {
  const secret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "").trim();

  if (!isProductionRuntime) {
    return secret || "bilwi-noticias-dev-secret";
  }

  if (!secret || PLACEHOLDER_SECRETS.has(secret)) {
    fail("define AUTH_SECRET con una clave aleatoria (por ejemplo: npx auth secret).");
  }
  if (secret.length < 32) {
    fail("AUTH_SECRET debe tener al menos 32 caracteres.");
  }

  return secret;
}

// Solo se usa la primera vez, cuando todavía no existe ninguna cuenta guardada.
export function getSeedAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!isProductionRuntime) {
    return { email: email || DEFAULT_ADMIN_EMAIL, password: password || DEFAULT_ADMIN_PASSWORD };
  }

  if (!email || !email.includes("@")) {
    fail("define ADMIN_EMAIL con el correo de la primera cuenta de administración.");
  }
  if (!password || password === DEFAULT_ADMIN_PASSWORD) {
    fail("define ADMIN_PASSWORD con una contraseña propia (no la de ejemplo).");
  }
  if (password.length < 12) {
    fail("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
  }

  return { email, password };
}
