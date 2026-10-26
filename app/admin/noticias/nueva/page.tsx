"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BodyImages, invalidVideoLinks } from "@/components/body-images";
import { IconImage } from "@/components/icons";
import { parseBlock, splitParagraphs } from "@/lib/article-body";
import { uploadImage } from "@/lib/upload-image";
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
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [titleError, setTitleError] = useState(false);
  const [bodyUploading, setBodyUploading] = useState(false);
  const cursorRef = useRef<number | null>(null);

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
    if (!form.title.trim()) {
      setTitleError(true);
      setMessageTone("error");
      setMessage("Escribe un título antes de guardar.");
      document.getElementById("news-title")?.focus();
      return;
    }

    setTitleError(false);

    const invalid = invalidVideoLinks(form.content);
    if (invalid > 0) {
      setMessageTone("error");
      setMessage(
        invalid === 1
          ? "Hay un video con un enlace que no es de YouTube ni de Facebook."
          : `Hay ${invalid} videos con enlaces que no son de YouTube ni de Facebook.`,
      );
      document.querySelector<HTMLInputElement>('[id^="body-video-"][aria-invalid="true"]')?.focus();
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let image = form.image;

      if (imageFile) {
        setUploadingImage(true);
        image = await uploadImage(imageFile);
        setForm((current) => ({ ...current, image }));
        setImageFile(null);
      }

      // Sin resumen, el almacén toma el primer párrafo: se evita que sea una imagen.
      const firstText = splitParagraphs(form.content).find((paragraph) => parseBlock(paragraph).type === "paragraph") ?? "";
      const payload = {
        ...form,
        excerpt: form.excerpt.trim() || firstText,
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

      setMessageTone("success");
      setMessage(editSlug ? "Noticia actualizada correctamente." : "Noticia creada correctamente.");
      router.push("/admin/noticias");
      router.refresh();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la noticia.");
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  }

  const preview = imagePreview || form.image;
  const busy = saving || uploadingImage || bodyUploading;

  return (
    <form
      className="editor"
      // La imagen subida se guarda como ruta relativa (/uploads/…), que el navegador no acepta como
      // type="url" y bloqueaba «Publicar» sin aviso. Las validaciones las hace submit().
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit("published");
      }}
      aria-busy={busy}
    >
      <div className="editor-main panel">
        <h2 className="panel-title">{editSlug ? "Editar noticia" : "Nueva noticia"}</h2>

        <div className="field">
          <label htmlFor="news-title">Título</label>
          <input
            id="news-title"
            className="input-title"
            type="text"
            value={form.title}
            aria-invalid={titleError || undefined}
            aria-describedby={titleError ? "news-title-error" : undefined}
            onChange={(event) => {
              setForm({ ...form, title: event.target.value });
              if (titleError && event.target.value.trim()) setTitleError(false);
            }}
            placeholder="Titular de la noticia"
          />
          {titleError ? (
            <p id="news-title-error" className="field-error">
              El título es obligatorio.
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="news-slug">
            Dirección web <span className="field-optional">se genera del título si la dejas vacía</span>
          </label>
          <div className="input-prefix">
            <span>/noticias/</span>
            <input
              id="news-slug"
              type="text"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              placeholder="titulo-de-la-noticia"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="news-excerpt">
            Resumen <span className="field-optional">{form.excerpt.length} caracteres · aparece bajo el titular</span>
          </label>
          <textarea
            id="news-excerpt"
            rows={3}
            value={form.excerpt}
            onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
            placeholder="Una o dos frases que expliquen la noticia"
          />
        </div>

        <div className="field">
          <label htmlFor="news-content">
            Contenido <span className="field-optional">separa los párrafos con una línea en blanco</span>
          </label>
          <textarea
            id="news-content"
            className="input-body"
            rows={18}
            value={form.content}
            onChange={(event) => {
              cursorRef.current = event.target.selectionStart;
              setForm({ ...form, content: event.target.value });
            }}
            onSelect={(event) => {
              cursorRef.current = event.currentTarget.selectionStart;
            }}
            placeholder="Escribe aquí el artículo completo"
            aria-describedby="news-content-hint"
          />
          <p id="news-content-hint" className="form-hint">
            Las imágenes aparecen en el texto como <code>![pie](dirección)</code> y los videos como{" "}
            <code>!video[pie](enlace)</code>. Puedes editarlos abajo.
          </p>
        </div>

        <BodyImages
          content={form.content}
          onChange={(content) => setForm((current) => ({ ...current, content }))}
          cursorRef={cursorRef}
          onBusyChange={setBodyUploading}
        />
      </div>

      <aside className="editor-side">
        <section className="panel">
          <h2 className="panel-title">Publicación</h2>
          <div className="field">
            <label htmlFor="news-status">Estado</label>
            <select
              id="news-status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as FormState["status"] })}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="scheduled">Programado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm({ ...form, featured: event.target.checked })}
            />
            <span>Mostrar en el orden del día de la portada</span>
          </label>

          <div aria-live="polite">
            {message ? (
              <p className={`notice notice--${messageTone}`} role={messageTone === "error" ? "alert" : undefined}>
                {message}
              </p>
            ) : null}
          </div>

          <div className="editor-actions">
            <button className="button button--primary button--block" type="submit" disabled={busy}>
              {uploadingImage || bodyUploading ? "Subiendo imagen…" : saving ? "Guardando…" : "Publicar"}
            </button>
            <button
              className="button button--secondary button--block"
              type="button"
              onClick={() => void submit("draft")}
              disabled={busy}
            >
              Guardar borrador
            </button>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Sección y autoría</h2>
          <div className="field">
            <label htmlFor="news-category">Categoría</label>
            <select
              id="news-category"
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
          </div>
          <div className="field">
            <label htmlFor="news-author">Autor</label>
            <input
              id="news-author"
              type="text"
              value={form.author}
              onChange={(event) => setForm({ ...form, author: event.target.value })}
              placeholder="Nombre del autor"
            />
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Imagen principal</h2>
          <div className={`image-drop${preview ? " image-drop--filled" : ""}`}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vista previa de la imagen principal" />
            ) : (
              <div className="image-drop-empty">
                <IconImage size={28} />
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="news-file" className="button button--secondary button--block file-button">
              {imageFile ? "Cambiar archivo" : "Subir imagen"}
            </label>
            <input
              id="news-file"
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setImageFile(file);
              }}
            />
            {imageFile ? <p className="form-hint">Archivo: {imageFile.name}. Se sube al guardar.</p> : null}
          </div>
          <div className="field">
            <label htmlFor="news-image">O pega una dirección de imagen</label>
            <input
              id="news-image"
              type="url"
              value={form.image}
              onChange={(event) => setForm({ ...form, image: event.target.value })}
              placeholder="https://..."
            />
          </div>
        </section>
      </aside>
    </form>
  );
}
