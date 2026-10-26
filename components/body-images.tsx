"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { SafeImage } from "@/components/story-image";
import { IconImage, IconTrash, IconVideo } from "@/components/icons";
import { imageMarkup, joinParagraphs, parseBlock, splitParagraphs, videoMarkup } from "@/lib/article-body";
import type { BodyBlock } from "@/lib/article-body";
import { uploadImage } from "@/lib/upload-image";
import { capturePoster, checkClip, uploadClip } from "@/lib/upload-video";
import { MAX_CLIP_MB, MAX_CLIP_SECONDS, isValidFullVideoUrl, platformName } from "@/lib/video";

type Props = {
  content: string;
  onChange: (content: string) => void;
  /** Última posición del cursor en el texto; null si nunca se tocó (se añade al final). */
  cursorRef: RefObject<number | null>;
  onBusyChange?: (busy: boolean) => void;
};

type MediaBlock = Exclude<BodyBlock, { type: "paragraph" }>;

/** Clips del cuerpo que todavía no tienen un enlace válido al video completo. */
export function clipsMissingLink(content: string) {
  return splitParagraphs(content)
    .map(parseBlock)
    .filter((block) => block.type === "video" && !isValidFullVideoUrl(block.full)).length;
}

/** Inserta la marca después del párrafo donde está el cursor (o al final). */
function insertAtCursor(content: string, cursor: number | null, markups: string[]) {
  const insertion = markups.join("\n\n");

  if (cursor === null || cursor >= content.length) {
    return joinParagraphs([...splitParagraphs(content), insertion]);
  }

  const boundary = content.indexOf("\n\n", cursor);
  const splitAt = boundary === -1 ? content.length : boundary;
  const before = splitParagraphs(content.slice(0, splitAt));
  const after = splitParagraphs(content.slice(splitAt));
  return joinParagraphs([...before, insertion, ...after]);
}

export function BodyImages({ content, onChange, cursorRef, onBusyChange }: Props) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const paragraphs = splitParagraphs(content);
  const media = paragraphs
    .map((paragraph, index) => ({ index, block: parseBlock(paragraph) }))
    .filter((item): item is { index: number; block: MediaBlock } => item.block.type !== "paragraph");
  const busy = status !== "";

  function setBusy(next: string) {
    setStatus(next);
    onBusyChange?.(next !== "");
  }

  async function addImages(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;

    const cursor = cursorRef.current;
    setError("");
    const uploaded: string[] = [];
    const failed: string[] = [];

    for (const file of files) {
      setBusy(`Subiendo imagen ${uploaded.length + failed.length + 1} de ${files.length}…`);
      try {
        uploaded.push(imageMarkup(await uploadImage(file)));
      } catch {
        failed.push(file.name);
      }
    }

    if (uploaded.length > 0) {
      onChange(insertAtCursor(content, cursor, uploaded));
    }
    if (failed.length > 0) {
      setError(`No se pudieron subir: ${failed.join(", ")}. Revisa la conexión e inténtalo de nuevo.`);
    }
    setBusy("");
  }

  async function addClip(file: File | undefined) {
    if (!file) return;
    const cursor = cursorRef.current;
    setError("");

    try {
      setBusy("Revisando el clip…");
      const problem = await checkClip(file);
      if (problem) {
        setError(problem);
        return;
      }

      const src = await uploadClip(file, (fraction) => setBusy(`Subiendo clip… ${Math.round(fraction * 100)}%`));
      setBusy("Preparando la portada…");
      const poster = await capturePoster(file);
      onChange(insertAtCursor(content, cursor, [videoMarkup(src, "", poster, "")]));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el clip.");
    } finally {
      setBusy("");
    }
  }

  function update(index: number, next: string | null) {
    const list = [...paragraphs];
    if (next === null) {
      list.splice(index, 1);
    } else {
      list[index] = next;
    }
    onChange(joinParagraphs(list));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= paragraphs.length) return;
    const list = [...paragraphs];
    [list[index], list[target]] = [list[target], list[index]];
    onChange(joinParagraphs(list));
  }

  function positionLabel(index: number) {
    const textBefore = paragraphs.slice(0, index).filter((paragraph) => parseBlock(paragraph).type === "paragraph").length;
    return textBefore === 0 ? "Al inicio del texto" : `Después del párrafo ${textBefore}`;
  }

  let imageNumber = 0;
  let clipNumber = 0;

  return (
    <section className="body-images" aria-labelledby="body-images-title">
      <div className="body-images-head">
        <div>
          <h3 id="body-images-title" className="body-images-title">
            Imágenes y clips en el cuerpo <span className="segmented-count">{media.length}</span>
          </h3>
          <p className="form-hint">
            Se colocan después del párrafo donde dejaste el cursor; luego puedes moverlos. Clips: hasta {MAX_CLIP_SECONDS}{" "}
            segundos y {MAX_CLIP_MB} MB, siempre con el enlace al video completo.
          </p>
        </div>
        <div className="body-images-buttons">
          <label className={`button button--secondary file-button${busy ? " is-disabled" : ""}`} htmlFor="body-images-input">
            <IconImage size={18} />
            Añadir imágenes
          </label>
          <input
            id="body-images-input"
            className="visually-hidden"
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            onChange={(event) => {
              void addImages(event.target.files);
              event.target.value = "";
            }}
          />
          <label className={`button button--secondary file-button${busy ? " is-disabled" : ""}`} htmlFor="body-clip-input">
            <IconVideo size={18} />
            Añadir clip de video
          </label>
          <input
            id="body-clip-input"
            className="visually-hidden"
            type="file"
            accept="video/mp4,video/quicktime"
            disabled={busy}
            onChange={(event) => {
              void addClip(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <div aria-live="polite">
        {busy ? <p className="notice notice--info">{status}</p> : null}
        {error ? (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {media.length > 0 ? (
        <ol className="body-images-list">
          {media.map(({ index, block }) => {
            const isClip = block.type === "video";
            const number = isClip ? ++clipNumber : ++imageNumber;
            const label = isClip ? `clip ${number}` : `imagen ${number}`;
            const linkOk = isClip && isValidFullVideoUrl(block.full);

            return (
              <li key={`${block.src}-${index}`} className={`body-image${isClip ? " body-image--clip" : ""}`}>
                <span className="body-image-thumb">
                  {isClip ? (
                    block.poster ? (
                      <SafeImage src={block.poster} label="Clip" sizes="128px" />
                    ) : (
                      <span className="image-fallback">Clip</span>
                    )
                  ) : (
                    <SafeImage src={block.src} label={String(number)} sizes="128px" />
                  )}
                  {isClip ? (
                    <span className="body-image-kind">
                      <IconVideo size={14} /> Clip
                    </span>
                  ) : null}
                </span>
                <div className="body-image-main">
                  <div className="field">
                    <label htmlFor={`body-caption-${index}`}>
                      {isClip ? `Pie del clip ${number}` : `Pie de foto ${number}`}{" "}
                      <span className="field-optional">{positionLabel(index)}</span>
                    </label>
                    <input
                      id={`body-caption-${index}`}
                      type="text"
                      value={block.caption}
                      placeholder={isClip ? "Qué muestra el clip" : "Describe la imagen o indica el crédito"}
                      onChange={(event) =>
                        update(
                          index,
                          block.type === "video"
                            ? videoMarkup(block.src, event.target.value, block.poster, block.full)
                            : imageMarkup(block.src, event.target.value),
                        )
                      }
                    />
                  </div>

                  {block.type === "video" ? (
                    <div className="field">
                      <label htmlFor={`body-full-${index}`}>
                        Enlace al video completo{" "}
                        <span className="field-optional">
                          {linkOk ? `se mostrará «Ver el video completo en ${platformName(block.full)}»` : "obligatorio: YouTube, Facebook u otra red"}
                        </span>
                      </label>
                      <input
                        id={`body-full-${index}`}
                        type="url"
                        inputMode="url"
                        value={block.full}
                        placeholder="https://www.youtube.com/watch?v=…"
                        aria-invalid={!linkOk || undefined}
                        aria-describedby={!linkOk ? `body-full-error-${index}` : undefined}
                        onChange={(event) => update(index, videoMarkup(block.src, block.caption, block.poster, event.target.value))}
                      />
                      {!linkOk ? (
                        <p id={`body-full-error-${index}`} className="field-error">
                          Pega el enlace donde está el video completo. Sin él no se puede publicar.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="body-image-actions">
                    <button className="button button--ghost button--small" type="button" onClick={() => move(index, -1)} disabled={index === 0}>
                      Subir
                    </button>
                    <button
                      className="button button--ghost button--small"
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === paragraphs.length - 1}
                    >
                      Bajar
                    </button>
                    <button
                      className="icon-button icon-button--danger"
                      type="button"
                      title="Quitar del cuerpo"
                      aria-label={`Quitar ${label} del cuerpo`}
                      onClick={() => update(index, null)}
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="body-images-empty">Todavía no hay imágenes ni clips dentro del texto.</p>
      )}
    </section>
  );
}
