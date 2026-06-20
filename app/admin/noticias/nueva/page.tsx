"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { editorialSections } from "@/lib/site-data";

type FormState = {
  title: string;
  slug: string;
  category: string;
  author: string;
  image: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "scheduled" | "archived";
  featured: boolean;
};

const emptyState: FormState = {
  title: "",
  slug: "",
  category: "Locales",
  author: "Redaccion Bilwi",
  image: "",
  excerpt: "",
  content: "",
  status: "draft",
  featured: false,
};

const categoryOptions = editorialSections.map((section) => section.label);

export default function NuevaNoticiaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");
  const [form, setForm] = useState<FormState>(emptyState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  useEffect(() => {
    if (!editSlug) {
      return;
    }

    let cancelled = false;

    async function loadPost() {
      const response = await fetch(`/api/noticias/${editSlug}`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (cancelled || !data.item) {
        return;
      }

      setForm({
        title: data.item.title || "",
        slug: data.item.slug || "",
        category: data.item.category || "Locales",
        author: data.item.author || "Redaccion Bilwi",
        image: data.item.image || "",
        excerpt: data.item.excerpt || "",
        content: data.item.content || "",
        status: data.item.status || "draft",
        featured: Boolean(data.item.featured),
      });
      setImageFile(null);
    }

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [editSlug]);

  async function submit(status: FormState["status"]) {
    setSaving(true);
    setMessage("");

    try {
      let image = form.image;

      if (imageFile) {
        setUploadingImage(true);
        const uploadForm = new FormData();
        uploadForm.append("file", imageFile);

        const uploadResponse = await fetch("/api/uploads", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json().catch(() => null);
          throw new Error(error?.message || "No se pudo subir la imagen.");
        }

        const uploadData = await uploadResponse.json();
        image = uploadData.url;
        setForm((current) => ({ ...current, image: uploadData.url }));
        setImageFile(null);
      }

      const payload = {
        ...form,
        image,
        status,
      };

      const response = await fetch(editSlug ? `/api/noticias/${editSlug}` : "/api/noticias", {
        method: editSlug ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "No se pudo guardar la noticia.");
      }

      setMessage(editSlug ? "Noticia actualizada correctamente." : "Noticia creada correctamente.");
      router.push("/admin/noticias");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la noticia.");
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  }

  return (
    <div className="admin-grid">
      <section className="panel-card">
        <div className="section-title">
          <div>
            <h2>{editSlug ? "Editar noticia" : "Crear noticia"}</h2>
            <p className="muted">
              Formulario base para titulo, slug, categoria, imagen y contenido.
            </p>
          </div>
        </div>

        <form
          className="stack-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit("published");
          }}
        >
          <div className="form-grid">
            <label>
              Titulo
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Titulo de la noticia"
              />
            </label>
            <label>
              Slug
              <input
                type="text"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                placeholder="titulo-de-la-noticia"
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Categoria
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                {form.category && !categoryOptions.includes(form.category) ? (
                  <option value={form.category}>{form.category}</option>
                ) : null}
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="Sociedad">Sociedad</option>
                <option value="Opinion">Opinion</option>
                <option value="Infraestructura">Infraestructura</option>
                <option value="Medio Ambiente">Medio Ambiente</option>
              </select>
            </label>
            <label>
              Autor
              <input
                type="text"
                value={form.author}
                onChange={(event) => setForm({ ...form, author: event.target.value })}
                placeholder="Nombre del autor"
              />
            </label>
          </div>

          <label>
            Imagen
            <input
              type="url"
              value={form.image}
              onChange={(event) => setForm({ ...form, image: event.target.value })}
              placeholder="https://..."
            />
          </label>

          <label>
            O subir imagen
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setImageFile(file);
              }}
            />
          </label>

          {imageFile ? (
            <p className="article-meta">Archivo seleccionado: {imageFile.name}</p>
          ) : null}

          {(imagePreview || form.image) ? (
            <div className="panel-card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  minHeight: 240,
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.55)), url(${imagePreview || form.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ padding: 20, color: "#fff" }}>
                  <span className="eyebrow" style={{ color: "#fff" }}>
                    Vista previa
                  </span>
                  <h3 style={{ margin: "8px 0 0" }}>{form.title || "Titulo de la noticia"}</h3>
                  <p style={{ margin: "8px 0 0", opacity: 0.92 }}>
                    {form.category || "Categoria"} · {form.author || "Redaccion Bilwi"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel-card" style={{ minHeight: 240, display: "grid", placeItems: "center" }}>
              <p className="muted" style={{ margin: 0, textAlign: "center" }}>
                La vista previa de la imagen aparecerá aqui cuando pegues una URL o selecciones un archivo.
              </p>
            </div>
          )}

          <label>
            Resumen
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
              placeholder="Breve descripcion de la noticia"
            />
          </label>

          <label>
            Contenido
            <textarea
              rows={10}
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              placeholder="Escribe aqui el articulo completo"
            />
          </label>

          <div className="form-grid">
            <label>
              Estado
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as FormState["status"] })
                }
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="scheduled">Programado</option>
                <option value="archived">Archivado</option>
              </select>
            </label>
            <label style={{ alignSelf: "end" }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm({ ...form, featured: event.target.checked })}
              />
              {" "}Marcar como destacada
            </label>
          </div>

          {message ? (
            <p className="article-meta" style={{ color: saving ? "#6b7280" : "#0d6efd" }}>
              {message}
            </p>
          ) : null}

          <div className="form-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => void submit("draft")}
              disabled={saving || uploadingImage}
            >
              {uploadingImage ? "Subiendo..." : "Guardar borrador"}
            </button>
            <button className="button button-primary" type="submit" disabled={saving || uploadingImage}>
              {saving ? "Guardando..." : uploadingImage ? "Subiendo..." : "Publicar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
