"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
    <div className="admin-roster-grid">
      {error ? <div className="admin-inline-error">{error}</div> : null}
      {ordered.map((item) => {
        const isEditing = editingEmail === item.email;

        return (
          <div key={item.email} className={`admin-roster-card${!item.active ? " admin-roster-card--inactive" : ""}`}>
            <div className="admin-roster-card-top">
              <div className="admin-roster-avatar avatar">{item.name.slice(0, 1)}</div>
              <div className="admin-roster-heading">
                <h3>{item.name}</h3>
                <p>{item.role}</p>
              </div>
              <span className={`admin-role-pill${item.active ? "" : " admin-role-pill--off"}`}>
                {item.active ? item.status : "Inactivo"}
              </span>
            </div>

            <p className="muted" style={{ margin: 0 }}>
              {item.scope}
            </p>

            <div className="admin-roster-meta">
              <span>{item.email}</span>
              <span>{item.lastSeen}</span>
            </div>

            <div className="admin-news-actions">
              <button className="admin-news-action" type="button" onClick={() => beginEdit(item)} disabled={busyEmail === item.email}>
                Editar
              </button>
              <button
                className="admin-news-action"
                type="button"
                onClick={() => mutateUser(item.email, { active: !item.active })}
                disabled={busyEmail === item.email}
              >
                {item.active ? "Desactivar" : "Activar"}
              </button>
            </div>

            {isEditing && draft ? (
              <div className="admin-inline-editor">
                <div className="admin-field-grid">
                  <label className="admin-field">
                    <span>Nombre</span>
                    <input
                      value={draft.name}
                      onChange={(event) => setDraft((current) => (current ? { ...current, name: event.target.value } : current))}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Rol</span>
                    <input
                      value={draft.role}
                      onChange={(event) => setDraft((current) => (current ? { ...current, role: event.target.value } : current))}
                    />
                  </label>
                </div>

                <label className="admin-field">
                  <span>Alcance</span>
                  <input
                    value={draft.scope}
                    onChange={(event) => setDraft((current) => (current ? { ...current, scope: event.target.value } : current))}
                  />
                </label>

                <div className="admin-field-grid">
                  <label className="admin-field">
                    <span>Estado</span>
                    <input
                      value={draft.status}
                      onChange={(event) => setDraft((current) => (current ? { ...current, status: event.target.value } : current))}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Ultimo acceso</span>
                    <input
                      value={draft.lastSeen}
                      onChange={(event) => setDraft((current) => (current ? { ...current, lastSeen: event.target.value } : current))}
                    />
                  </label>
                </div>

                <label className="admin-switch-row">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(event) => setDraft((current) => (current ? { ...current, active: event.target.checked } : current))}
                  />
                  <span>Usuario habilitado para acceder al panel</span>
                </label>

                <div className="admin-field-actions">
                  <button className="button button-primary" type="button" onClick={() => saveEdit(item.email)} disabled={busyEmail === item.email}>
                    Guardar cambios
                  </button>
                  <button className="button button-secondary" type="button" onClick={cancelEdit} disabled={busyEmail === item.email}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
