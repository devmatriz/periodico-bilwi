"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CategorySummary } from "@/lib/content-store";

type CategoryDraft = {
  label: string;
  badge: string;
  title: string;
  description: string;
  chipsText: string;
  image: string;
  background: string;
  active: boolean;
};

function toDraft(item: CategorySummary): CategoryDraft {
  return {
    label: item.label,
    badge: item.badge,
    title: item.title,
    description: item.description,
    chipsText: item.chips.join(", "),
    image: item.image,
    background: item.background,
    active: item.active,
  };
}

function normalizeChips(value: string) {
  return value
    .split(",")
    .map((chip) => chip.trim())
    .filter(Boolean);
}

export function AdminCategoryManager({ items }: { items: CategorySummary[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(items);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<CategoryDraft | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const ordered = useMemo(() => [...categories].sort((left, right) => right.count - left.count), [categories]);

  async function mutateCategory(slug: string, payload: Record<string, unknown>) {
    setBusySlug(slug);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { item?: CategorySummary; message?: string } | null;

      if (!response.ok || !data?.item) {
        throw new Error(data?.message || "No se pudo guardar la categoria.");
      }

      startTransition(() => {
        setCategories((current) => current.map((item) => (item.slug === slug ? data.item! : item)));
        router.refresh();
      });
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "No se pudo guardar la categoria.");
    } finally {
      setBusySlug(null);
    }
  }

  function beginEdit(item: CategorySummary) {
    setEditingSlug(item.slug);
    setDraft(toDraft(item));
    setError(null);
  }

  function cancelEdit() {
    setEditingSlug(null);
    setDraft(null);
  }

  async function saveEdit(slug: string) {
    if (!draft) {
      return;
    }

    await mutateCategory(slug, {
      label: draft.label,
      badge: draft.badge,
      title: draft.title,
      description: draft.description,
      chips: normalizeChips(draft.chipsText),
      image: draft.image,
      background: draft.background,
      active: draft.active,
    });

    cancelEdit();
  }

  return (
    <div className="admin-category-list">
      {error ? <div className="admin-inline-error">{error}</div> : null}
      {ordered.map((item) => {
        const isEditing = editingSlug === item.slug;

        return (
          <div key={item.slug} className={`admin-category-row${!item.active ? " admin-category-row--inactive" : ""}`}>
            <div className="admin-category-row-top">
              <div>
                <span className="eyebrow">{item.label}</span>
                <h3>{item.title}</h3>
              </div>
              <div className="admin-category-row-stack">
                <strong>{item.count}</strong>
                <span className={`admin-role-pill${item.active ? "" : " admin-role-pill--off"}`}>
                  {item.active ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>

            <p>{item.description}</p>

            <div className="admin-category-chips">
              {item.chips.map((chip) => (
                <span key={chip} className="admin-board-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="admin-news-actions">
              <button className="admin-news-action" type="button" onClick={() => beginEdit(item)} disabled={busySlug === item.slug}>
                Editar
              </button>
              <button
                className="admin-news-action"
                type="button"
                onClick={() => mutateCategory(item.slug, { active: !item.active })}
                disabled={busySlug === item.slug}
              >
                {item.active ? "Desactivar" : "Activar"}
              </button>
            </div>

            {isEditing && draft ? (
              <div className="admin-inline-editor">
                <div className="admin-field-grid">
                  <label className="admin-field">
                    <span>Etiqueta</span>
                    <input
                      value={draft.label}
                      onChange={(event) => setDraft((current) => (current ? { ...current, label: event.target.value } : current))}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Insignia</span>
                    <input
                      value={draft.badge}
                      onChange={(event) => setDraft((current) => (current ? { ...current, badge: event.target.value } : current))}
                    />
                  </label>
                </div>

                <label className="admin-field">
                  <span>Titulo</span>
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((current) => (current ? { ...current, title: event.target.value } : current))}
                  />
                </label>

                <label className="admin-field">
                  <span>Descripcion</span>
                  <textarea
                    value={draft.description}
                    onChange={(event) => setDraft((current) => (current ? { ...current, description: event.target.value } : current))}
                  />
                </label>

                <div className="admin-field-grid">
                  <label className="admin-field">
                    <span>Imagen</span>
                    <input
                      value={draft.image}
                      onChange={(event) => setDraft((current) => (current ? { ...current, image: event.target.value } : current))}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Fondo</span>
                    <input
                      value={draft.background}
                      onChange={(event) => setDraft((current) => (current ? { ...current, background: event.target.value } : current))}
                    />
                  </label>
                </div>

                <label className="admin-field">
                  <span>Etiquetas</span>
                  <input
                    value={draft.chipsText}
                    onChange={(event) => setDraft((current) => (current ? { ...current, chipsText: event.target.value } : current))}
                  />
                </label>

                <label className="admin-switch-row">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(event) => setDraft((current) => (current ? { ...current, active: event.target.checked } : current))}
                  />
                  <span>Categoria activa en la portada publica</span>
                </label>

                <div className="admin-field-actions">
                  <button className="button button-primary" type="button" onClick={() => saveEdit(item.slug)} disabled={busySlug === item.slug}>
                    Guardar cambios
                  </button>
                  <button className="button button-secondary" type="button" onClick={cancelEdit} disabled={busySlug === item.slug}>
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
