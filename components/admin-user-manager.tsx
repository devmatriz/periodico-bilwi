"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/admin-status";
import type { EditorialUserSetting } from "@/lib/editorial-admin-store";

type UserDraft = {
  name: string;
  role: string;
  scope: string;
  status: string;
  lastSeen: string;
  active: boolean;
};

function toUserDraft(item: EditorialUserSetting): UserDraft {
  return {
    name: item.name,
    role: item.role,
    scope: item.scope,
    status: item.status,
    lastSeen: item.lastSeen,
    active: item.active,
  };
}

export function AdminUserManager({ items }: { items: EditorialUserSetting[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(items);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const ordered = useMemo(() => [...users], [users]);

  async function mutateUser(email: string, payload: Record<string, unknown>) {
    setBusyEmail(email);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { item?: EditorialUserSetting; message?: string } | null;

      if (!response.ok || !data?.item) {
        throw new Error(data?.message || "No se pudo guardar el usuario.");
      }

      startTransition(() => {
        setUsers((current) => current.map((item) => (item.email === email ? data.item! : item)));
        router.refresh();
      });
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "No se pudo guardar el usuario.");
    } finally {
      setBusyEmail(null);
    }
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

    await mutateUser(email, {
      name: draft.name,
      role: draft.role,
      scope: draft.scope,
      status: draft.status,
      lastSeen: draft.lastSeen,
      active: draft.active,
    });

    cancelEdit();
  }

  return (
    <div className="admin-stack">
      <p className="admin-intro">Personas con acceso al panel editorial, su rol y el alcance de su trabajo.</p>
      {error ? (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="manage-list">
        {ordered.map((item) => {
          const isEditing = editingEmail === item.email;
          const busy = busyEmail === item.email;

          return (
            <li key={item.email} className={`manage-item${!item.active ? " manage-item--off" : ""}`}>
              <div className="manage-row">
                <span className="comment-avatar comment-avatar--lg" aria-hidden="true">
                  {item.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="manage-main">
                  <h2 className="manage-name">
                    {item.name}
                    <StatusPill status={item.active ? "active" : "inactive"} label={item.active ? item.status : "Inactivo"} />
                  </h2>
                  <p className="manage-title">{item.role}</p>
                  <p className="manage-desc">{item.scope}</p>
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
                  <button
                    className="button button--ghost button--small"
                    type="button"
                    onClick={() => mutateUser(item.email, { active: !item.active })}
                    disabled={busy}
                  >
                    {item.active ? "Desactivar" : "Activar"}
                  </button>
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
                      <label htmlFor={`user-role-${item.id}`}>Rol</label>
                      <input
                        id={`user-role-${item.id}`}
                        value={draft.role}
                        onChange={(event) => setDraft((current) => (current ? { ...current, role: event.target.value } : current))}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor={`user-scope-${item.id}`}>Alcance</label>
                    <input
                      id={`user-scope-${item.id}`}
                      value={draft.scope}
                      onChange={(event) => setDraft((current) => (current ? { ...current, scope: event.target.value } : current))}
                    />
                  </div>

                  <div className="form-row">
                    <div className="field">
                      <label htmlFor={`user-status-${item.id}`}>Estado</label>
                      <input
                        id={`user-status-${item.id}`}
                        value={draft.status}
                        onChange={(event) => setDraft((current) => (current ? { ...current, status: event.target.value } : current))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`user-seen-${item.id}`}>Último acceso</label>
                      <input
                        id={`user-seen-${item.id}`}
                        value={draft.lastSeen}
                        onChange={(event) => setDraft((current) => (current ? { ...current, lastSeen: event.target.value } : current))}
                      />
                    </div>
                  </div>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(event) => setDraft((current) => (current ? { ...current, active: event.target.checked } : current))}
                    />
                    <span>Usuario habilitado para acceder al panel</span>
                  </label>

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
