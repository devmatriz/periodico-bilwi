"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/admin-status";
import type { EditorialUserSetting } from "@/lib/user-store";

type UserDraft = {
  name: string;
  role: string;
  scope: string;
  status: string;
  active: boolean;
  isAdmin: boolean;
};

type NewUserDraft = {
  name: string;
  email: string;
  role: string;
  scope: string;
  isAdmin: boolean;
  password: string;
};

const emptyNewUser: NewUserDraft = { name: "", email: "", role: "Redacción", scope: "", isAdmin: false, password: "" };

// Sin letras que se confunden al dictarlas o copiarlas a mano (0/O, 1/l/I).
const PASSWORD_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePassword(length = 14) {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join("");
}

function toUserDraft(item: EditorialUserSetting): UserDraft {
  return {
    name: item.name,
    role: item.role,
    scope: item.scope,
    status: item.status,
    active: item.active,
    isAdmin: item.isAdmin,
  };
}

async function sendJson(url: string, method: string, payload?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => null)) as { item?: EditorialUserSetting; message?: string } | null;
  if (!response.ok) {
    throw new Error(data?.message || "No se pudo guardar el cambio.");
  }
  return data;
}

function userUrl(email: string) {
  return `/api/admin/users/${encodeURIComponent(email)}`;
}

/** Contraseña recién creada: se muestra una sola vez para pasarla a la persona. */
function TempPassword({ email, password, onClose }: { email: string; password: string; onClose: () => void }) {
  return (
    <div className="notice notice--info" role="status">
      <p>
        Contraseña temporal de <strong>{email}</strong>. Cópiala ahora y pásala a la persona por un canal privado; no se
        vuelve a mostrar. Tendrá que cambiarla al entrar.
      </p>
      <p className="temp-password">
        <code>{password}</code>
        <button className="button button--secondary button--small" type="button" onClick={() => navigator.clipboard?.writeText(password)}>
          Copiar
        </button>
        <button className="button button--ghost button--small" type="button" onClick={onClose}>
          Listo
        </button>
      </p>
    </div>
  );
}

export function AdminUserManager({ items, currentEmail }: { items: EditorialUserSetting[]; currentEmail: string }) {
  const router = useRouter();
  const [users, setUsers] = useState(items);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState<NewUserDraft>(emptyNewUser);
  const [revealed, setRevealed] = useState<{ email: string; password: string } | null>(null);
  const [, startTransition] = useTransition();

  function refresh(update: (current: EditorialUserSetting[]) => EditorialUserSetting[]) {
    startTransition(() => {
      setUsers(update);
      router.refresh();
    });
  }

  async function run(email: string, action: () => Promise<void>) {
    setBusyEmail(email);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo guardar el cambio.");
    } finally {
      setBusyEmail(null);
    }
  }

  function mutateUser(email: string, payload: Record<string, unknown>) {
    return run(email, async () => {
      const data = await sendJson(userUrl(email), "PATCH", payload);
      if (data?.item) {
        refresh((current) => current.map((item) => (item.email === email ? data.item! : item)));
      }
    });
  }

  function resetPassword(email: string) {
    if (!window.confirm(`¿Poner una contraseña temporal nueva a ${email}? La actual dejará de funcionar.`)) return;
    const password = generatePassword();
    return run(email, async () => {
      const data = await sendJson(`${userUrl(email)}/password`, "POST", { password });
      if (data?.item) {
        refresh((current) => current.map((item) => (item.email === email ? data.item! : item)));
      }
      setRevealed({ email, password });
    });
  }

  function removeUser(email: string) {
    if (!window.confirm(`¿Eliminar la cuenta de ${email}? Esta persona ya no podrá entrar al panel.`)) return;
    return run(email, async () => {
      await sendJson(userUrl(email), "DELETE");
      refresh((current) => current.filter((item) => item.email !== email));
    });
  }

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = newUser.password || generatePassword();
    await run("__new__", async () => {
      const data = await sendJson("/api/admin/users", "POST", { ...newUser, password });
      if (data?.item) {
        refresh((current) => [...current, data.item!]);
      }
      setRevealed({ email: newUser.email.trim().toLowerCase(), password });
      setNewUser(emptyNewUser);
      setCreating(false);
    });
  }

  function beginEdit(item: EditorialUserSetting) {
    setEditingEmail(item.email);
    setDraft(toUserDraft(item));
    setError(null);
  }

  function cancelEdit() {
    setEditingEmail(null);
    setDraft(null);
  }

  async function saveEdit(email: string) {
    if (!draft) {
      return;
    }

    await mutateUser(email, draft);
    cancelEdit();
  }

  const creatingBusy = busyEmail === "__new__";

  return (
    <div className="admin-stack">
      <div className="panel-head">
        <p className="admin-intro">
          Personas con acceso al panel. Las cuentas de administración también pueden crear cuentas y cambiar las secciones.
        </p>
        {!creating ? (
          <button className="button button--primary" type="button" onClick={() => setCreating(true)}>
            Nueva cuenta
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      ) : null}

      {revealed ? <TempPassword {...revealed} onClose={() => setRevealed(null)} /> : null}

      {creating ? (
        <form className="panel inline-editor" onSubmit={createUser} aria-busy={creatingBusy}>
          <h2 className="panel-title">Nueva cuenta</h2>
          <div className="form-row">
            <div className="field">
              <label htmlFor="new-user-name">Nombre</label>
              <input
                id="new-user-name"
                required
                value={newUser.name}
                onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="new-user-email">Correo</label>
              <input
                id="new-user-email"
                type="email"
                required
                autoComplete="off"
                value={newUser.email}
                onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="new-user-role">Cargo</label>
              <input
                id="new-user-role"
                value={newUser.role}
                onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="new-user-scope">Alcance</label>
              <input
                id="new-user-scope"
                placeholder="Por ejemplo: Locales y comunidad"
                value={newUser.scope}
                onChange={(event) => setNewUser((current) => ({ ...current, scope: event.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="new-user-password">Contraseña temporal</label>
            <div className="temp-password">
              <input
                id="new-user-password"
                type="text"
                autoComplete="off"
                minLength={12}
                aria-describedby="new-user-password-hint"
                value={newUser.password}
                onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))}
              />
              <button
                className="button button--secondary button--small"
                type="button"
                onClick={() => setNewUser((current) => ({ ...current, password: generatePassword() }))}
              >
                Generar
              </button>
            </div>
            <p className="form-hint" id="new-user-password-hint">
              Al menos 12 caracteres. Si la dejas vacía se genera una. La persona la cambiará al entrar.
            </p>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={newUser.isAdmin}
              onChange={(event) => setNewUser((current) => ({ ...current, isAdmin: event.target.checked }))}
            />
            <span>Cuenta de administración (puede crear cuentas y cambiar secciones)</span>
          </label>
          <div className="inline-editor-actions">
            <button className="button button--primary" type="submit" disabled={creatingBusy}>
              {creatingBusy ? "Creando…" : "Crear cuenta"}
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={() => {
                setCreating(false);
                setNewUser(emptyNewUser);
              }}
              disabled={creatingBusy}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <ul className="manage-list">
        {users.map((item) => {
          const isEditing = editingEmail === item.email;
          const busy = busyEmail === item.email;
          const isMe = item.email === currentEmail;

          return (
            <li key={item.email} className={`manage-item${!item.active ? " manage-item--off" : ""}`}>
              <div className="manage-row">
                <span className="comment-avatar comment-avatar--lg" aria-hidden="true">
                  {item.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="manage-main">
                  <h2 className="manage-name">
                    {item.name}
                    {isMe ? " (tú)" : ""}
                    <StatusPill status={item.active ? "active" : "inactive"} label={item.active ? item.status : "Inactivo"} />
                    {item.isAdmin ? <StatusPill status="green" label="Administración" /> : null}
                    {!item.hasPassword ? <StatusPill status="gray" label="Sin contraseña" /> : null}
                    {item.hasPassword && item.mustChangePassword ? <StatusPill status="gold" label="Contraseña temporal" /> : null}
                  </h2>
                  <p className="manage-title">{item.role}</p>
                  {item.scope ? <p className="manage-desc">{item.scope}</p> : null}
                  <p className="manage-meta">
                    <span>{item.email}</span>
                    <span>Último acceso: {item.lastSeen}</span>
                  </p>
                </div>
                <div className="manage-actions">
                  <button
                    className="button button--secondary button--small"
                    type="button"
                    onClick={() => (isEditing ? cancelEdit() : beginEdit(item))}
                    disabled={busy}
                    aria-expanded={isEditing}
                  >
                    {isEditing ? "Cerrar" : "Editar"}
                  </button>
                  {!isMe ? (
                    <>
                      <button className="button button--ghost button--small" type="button" onClick={() => resetPassword(item.email)} disabled={busy}>
                        {item.hasPassword ? "Contraseña temporal" : "Dar contraseña"}
                      </button>
                      <button
                        className="button button--ghost button--small"
                        type="button"
                        onClick={() => mutateUser(item.email, { active: !item.active })}
                        disabled={busy}
                      >
                        {item.active ? "Desactivar" : "Activar"}
                      </button>
                      <button className="button button--ghost button--small" type="button" onClick={() => removeUser(item.email)} disabled={busy}>
                        Eliminar
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {isEditing && draft ? (
                <div className="inline-editor">
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor={`user-name-${item.id}`}>Nombre</label>
                      <input
                        id={`user-name-${item.id}`}
                        value={draft.name}
                        onChange={(event) => setDraft((current) => (current ? { ...current, name: event.target.value } : current))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`user-role-${item.id}`}>Cargo</label>
                      <input
                        id={`user-role-${item.id}`}
                        value={draft.role}
                        onChange={(event) => setDraft((current) => (current ? { ...current, role: event.target.value } : current))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field">
                      <label htmlFor={`user-scope-${item.id}`}>Alcance</label>
                      <input
                        id={`user-scope-${item.id}`}
                        value={draft.scope}
                        onChange={(event) => setDraft((current) => (current ? { ...current, scope: event.target.value } : current))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`user-status-${item.id}`}>Estado</label>
                      <input
                        id={`user-status-${item.id}`}
                        value={draft.status}
                        onChange={(event) => setDraft((current) => (current ? { ...current, status: event.target.value } : current))}
                      />
                    </div>
                  </div>

                  {!isMe ? (
                    <>
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={draft.isAdmin}
                          onChange={(event) => setDraft((current) => (current ? { ...current, isAdmin: event.target.checked } : current))}
                        />
                        <span>Cuenta de administración</span>
                      </label>
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={draft.active}
                          onChange={(event) => setDraft((current) => (current ? { ...current, active: event.target.checked } : current))}
                        />
                        <span>Usuario habilitado para acceder al panel</span>
                      </label>
                    </>
                  ) : null}

                  <div className="inline-editor-actions">
                    <button className="button button--primary" type="button" onClick={() => saveEdit(item.email)} disabled={busy}>
                      {busy ? "Guardando…" : "Guardar cambios"}
                    </button>
                    <button className="button button--ghost" type="button" onClick={cancelEdit} disabled={busy}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
