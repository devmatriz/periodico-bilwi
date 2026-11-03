"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/admin-status";
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
    <div className="admin-stack">
      <p className="admin-intro">
        Los textos de cada sección aparecen en su portada pública. Desactivar una sección la oculta del índice y de la portada.
      </p>
      {error ? (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="manage-list">
        {ordered.map((item) => {
          const isEditing = editingSlug === item.slug;
          const busy = busySlug === item.slug;

          return (
            <li key={item.slug} className={`manage-item${!item.active ? " manage-item--off" : ""}`}>
              <div className="manage-row">
                <span className="tile tile--sm" aria-hidden="true">
                  {String(item.count).padStart(2, "0")}
                </span>
                <div className="manage-main">
                  <h2 className="manage-name">
                    {item.label}
                    <StatusPill status={item.active ? "active" : "inactive"} label={item.active ? "Activa" : "Inactiva"} />
                  </h2>
                  <p className="manage-title">{item.title}</p>
                  <p className="manage-desc">{item.description}</p>
                  {item.chips.length > 0 ? (
                    <ul className="tag-list" aria-label="Etiquetas">
                      {item.chips.map((chip) => (
                        <li key={chip}>{chip}</li>
                      ))}
                    </ul>
                  ) : null}
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
                    onClick={() => mutateCategory(item.slug, { active: !item.active })}
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
                      <label htmlFor={`cat-label-${item.slug}`}>Nombre</label>
                      <input
                        id={`cat-label-${item.slug}`}
                        value={draft.label}
                        onChange={(event) => setDraft((current) => (current ? { ...current, label: event.target.value } : current))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`cat-badge-${item.slug}`}>Insignia</label>
                      <input
                        id={`cat-badge-${item.slug}`}
                        value={draft.badge}
                        onChange={(event) => setDraft((current) => (current ? { ...current, badge: event.target.value } : current))}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor={`cat-title-${item.slug}`}>Título de la sección</label>
                    <input
                      id={`cat-title-${item.slug}`}
                      value={draft.title}
                      onChange={(event) => setDraft((current) => (current ? { ...current, title: event.target.value } : current))}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor={`cat-desc-${item.slug}`}>Descripción</label>
                    <textarea
                      id={`cat-desc-${item.slug}`}
                      rows={3}
                      value={draft.description}
                      onChange={(event) => setDraft((current) => (current ? { ...current, description: event.target.value } : current))}
                    />
                  </div>

                  <div className="form-row">
                    <div className="field">
                      <label htmlFor={`cat-image-${item.slug}`}>Imagen</label>
                      <input
                        id={`cat-image-${item.slug}`}
                        value={draft.image}
                        onChange={(event) => setDraft((current) => (current ? { ...current, image: event.target.value } : current))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`cat-bg-${item.slug}`}>Fondo</label>
                      <input
                        id={`cat-bg-${item.slug}`}
                        value={draft.background}
                        onChange={(event) => setDraft((current) => (current ? { ...current, background: event.target.value } : current))}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor={`cat-chips-${item.slug}`}>
                      Etiquetas <span className="field-optional">separadas por comas</span>
                    </label>
                    <input
                      id={`cat-chips-${item.slug}`}
                      value={draft.chipsText}
                      onChange={(event) => setDraft((current) => (current ? { ...current, chipsText: event.target.value } : current))}
                    />
                  </div>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(event) => setDraft((current) => (current ? { ...current, active: event.target.checked } : current))}
                    />
                    <span>Sección activa en el sitio público</span>
                  </label>

                  <div className="inline-editor-actions">
                    <button className="button button--primary" type="button" onClick={() => saveEdit(item.slug)} disabled={busy}>
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
