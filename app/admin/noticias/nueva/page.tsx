"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BodyImages, invalidVideoLinks } from "@/components/body-images";
import { IconImage } from "@/components/icons";
import { parseBlock, splitParagraphs } from "@/lib/article-body";
import { localeNames, localeNamesInSpanish, localePath, translationLocales } from "@/lib/i18n";
import type { TranslationLocale } from "@/lib/i18n";
import { uploadImage } from "@/lib/upload-image";
import { editorialSections } from "@/lib/site-data";

type StoryText = { title: string; excerpt: string; content: string };
type EditorLang = "es" | TranslationLocale;

type FormState = StoryText & {
  slug: string;
  category: string;
  author: string;
  image: string;
  status: "draft" | "published" | "scheduled" | "archived";
  featured: boolean;
  translations: Record<TranslationLocale, StoryText>;
};

const emptyText: StoryText = { title: "", excerpt: "", content: "" };

const emptyTranslations = Object.fromEntries(translationLocales.map((locale) => [locale, { ...emptyText }])) as Record<
  TranslationLocale,
  StoryText
>;

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
  translations: emptyTranslations,
};

const categoryOptions = editorialSections.map((section) => section.label);

const isFilled = (text: StoryText) => Boolean(text.title.trim() || text.excerpt.trim() || text.content.trim());
const isComplete = (text: StoryText) => Boolean(text.title.trim() && text.content.trim());

/** Sin resumen, el almacén toma el primer párrafo: se evita que sea una imagen o un video. */
function excerptOrFirstText(text: StoryText) {
  return text.excerpt.trim() || splitParagraphs(text.content).find((paragraph) => parseBlock(paragraph).type === "paragraph") || "";
}

export default function NuevaNoticiaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");
  const [form, setForm] = useState<FormState>(emptyState);
  const [lang, setLang] = useState<EditorLang>("es");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [titleError, setTitleError] = useState(false);
  const [bodyUploading, setBodyUploading] = useState(false);
  const cursorRef = useRef<number | null>(null);

  // Texto del idioma activo: español en los campos principales; los demás en `translations`.
  const text: StoryText = lang === "es" ? { title: form.title, excerpt: form.excerpt, content: form.content } : form.translations[lang];

  function setText(patch: Partial<StoryText>) {
    setForm((current) =>
      lang === "es"
        ? { ...current, ...patch }
        : { ...current, translations: { ...current.translations, [lang]: { ...current.translations[lang], ...patch } } },
    );
  }

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

      const stored = (data.item.translations ?? {}) as Partial<Record<TranslationLocale, Partial<StoryText>>>;
      const translations = Object.fromEntries(
        translationLocales.map((locale) => [
          locale,
          { title: stored[locale]?.title ?? "", excerpt: stored[locale]?.excerpt ?? "", content: stored[locale]?.content ?? "" },
        ]),
      ) as Record<TranslationLocale, StoryText>;

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
        translations,
      });
      setImageFile(null);
    }

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [editSlug]);

  function fail(text: string, tab?: EditorLang, focusSelector?: string) {
    setMessageTone("error");
    setMessage(text);
    if (tab) setLang(tab);
    if (focusSelector) {
      // Espera a que la pestaña elegida se dibuje antes de llevar el foco al campo.
      window.setTimeout(() => document.querySelector<HTMLElement>(focusSelector)?.focus(), 0);
    }
  }

  async function submit(status: FormState["status"]) {
    if (!form.title.trim()) {
      setTitleError(true);
      fail("Escribe un título antes de guardar.", "es", "#news-title");
      return;
    }

    setTitleError(false);

    for (const locale of translationLocales) {
      const translation = form.translations[locale];
      if (isFilled(translation) && !isComplete(translation)) {
        fail(
          `La versión en ${localeNamesInSpanish[locale]} necesita título y texto. Complétala o vacía sus campos para guardar solo en español.`,
          locale,
          translation.title.trim() ? "#news-content" : "#news-title",
        );
        return;
      }
    }

    for (const editorLang of ["es", ...translationLocales] as EditorLang[]) {
      const content = editorLang === "es" ? form.content : form.translations[editorLang].content;
      const invalid = invalidVideoLinks(content);
      if (invalid > 0) {
        const where = editorLang === "es" ? "" : ` (versión en ${localeNamesInSpanish[editorLang]})`;
        fail(
          invalid === 1
            ? `Hay un video con un enlace que no es de YouTube ni de Facebook${where}.`
            : `Hay ${invalid} videos con enlaces que no son de YouTube ni de Facebook${where}.`,
          editorLang,
          '[id^="body-video-"][aria-invalid="true"]',
        );
        return;
      }
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

      const translations = Object.fromEntries(
        translationLocales.map((locale) => {
          const translation = form.translations[locale];
          return [locale, isComplete(translation) ? { ...translation, excerpt: excerptOrFirstText(translation) } : emptyText];
        }),
      );

      const payload = {
        ...form,
        excerpt: excerptOrFirstText(form),
        image,
        status,
        translations,
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
  const tabs: EditorLang[] = ["es", ...translationLocales];
  const langName = localeNamesInSpanish[lang];
  const canCopySpanish = lang !== "es" && !isFilled(text) && isFilled(form);

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
        <div className="editor-head">
          <h2 className="panel-title">{editSlug ? "Editar noticia" : "Nueva noticia"}</h2>
          <div className="lang-tabs" role="tablist" aria-label="Idioma del texto">
            {tabs.map((tab) => {
              const tabText = tab === "es" ? form : form.translations[tab];
              const state = tab === "es" ? "Original" : isComplete(tabText) ? "Traducida" : isFilled(tabText) ? "Incompleta" : "Sin traducir";
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`lang-tab-${tab}`}
                  aria-selected={lang === tab}
                  aria-controls="editor-text"
                  className={`lang-tab lang-tab--${state === "Traducida" || state === "Original" ? "ok" : state === "Incompleta" ? "warn" : "empty"}`}
                  onClick={() => {
                    setLang(tab);
                    cursorRef.current = null;
                  }}
                >
                  {localeNames[tab]}
                  <span className="lang-tab-state">{state}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div id="editor-text" role="tabpanel" aria-labelledby={`lang-tab-${lang}`} className="editor-text">
          {lang !== "es" ? (
            <div className="notice notice--info editor-lang-note">
              <p>
                Versión en {langName}: se publica en <code>{localePath(lang, `/noticias/${form.slug || "…"}`)}</code>. Si la
                dejas vacía, los lectores en {langName} verán la noticia en español con un aviso. La categoría, el autor y
                la imagen principal son los mismos en todos los idiomas.
              </p>
              {canCopySpanish ? (
                <button
                  className="button button--secondary button--small"
                  type="button"
                  onClick={() => setText({ title: form.title, excerpt: form.excerpt, content: form.content })}
                >
                  Copiar el texto en español para traducirlo
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="news-title">
              Título {lang !== "es" ? <span className="field-optional">en {langName}</span> : null}
            </label>
            <input
              id="news-title"
              className="input-title"
              type="text"
              lang={lang}
              value={text.title}
              aria-invalid={(lang === "es" && titleError) || undefined}
              aria-describedby={lang === "es" && titleError ? "news-title-error" : undefined}
              onChange={(event) => {
                setText({ title: event.target.value });
                if (lang === "es" && titleError && event.target.value.trim()) setTitleError(false);
              }}
              placeholder={lang === "es" ? "Titular de la noticia" : "Headline"}
            />
            {lang === "es" && titleError ? (
              <p id="news-title-error" className="field-error">
                El título es obligatorio.
              </p>
            ) : null}
          </div>

          {lang === "es" ? (
            <div className="field">
              <label htmlFor="news-slug">
                Dirección web <span className="field-optional">se genera del título si la dejas vacía; es la misma en todos los idiomas</span>
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
          ) : null}

          <div className="field">
            <label htmlFor="news-excerpt">
              Resumen <span className="field-optional">{text.excerpt.length} caracteres · aparece bajo el titular</span>
            </label>
            <textarea
              id="news-excerpt"
              rows={3}
              lang={lang}
              value={text.excerpt}
              onChange={(event) => setText({ excerpt: event.target.value })}
              placeholder={lang === "es" ? "Una o dos frases que expliquen la noticia" : "One or two sentences explaining the story"}
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
              lang={lang}
              value={text.content}
              onChange={(event) => {
                cursorRef.current = event.target.selectionStart;
                setText({ content: event.target.value });
              }}
              onSelect={(event) => {
                cursorRef.current = event.currentTarget.selectionStart;
              }}
              placeholder={lang === "es" ? "Escribe aquí el artículo completo" : "Write the full story here"}
              aria-describedby="news-content-hint"
            />
            <p id="news-content-hint" className="form-hint">
              Las imágenes aparecen en el texto como <code>![pie](dirección)</code> y los videos como{" "}
              <code>!video[pie](enlace)</code>. Puedes editarlos abajo.
            </p>
          </div>

          <BodyImages
            key={lang}
            content={text.content}
            onChange={(content) => setText({ content })}
            cursorRef={cursorRef}
            onBusyChange={setBodyUploading}
          />
        </div>
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
