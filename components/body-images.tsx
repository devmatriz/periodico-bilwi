"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { SafeImage } from "@/components/story-image";
import { IconImage, IconTrash } from "@/components/icons";
import { imageMarkup, joinParagraphs, parseBlock, splitParagraphs } from "@/lib/article-body";
import { uploadImage } from "@/lib/upload-image";

type Props = {
  content: string;
  onChange: (content: string) => void;
  /** Última posición del cursor en el texto; null si nunca se tocó (se añade al final). */
  cursorRef: RefObject<number | null>;
  onBusyChange?: (busy: boolean) => void;
};

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
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const paragraphs = splitParagraphs(content);
  const images = paragraphs
    .map((paragraph, index) => ({ index, block: parseBlock(paragraph) }))
    .filter((item): item is { index: number; block: { type: "image"; src: string; caption: string } } => item.block.type === "image");

  function setBusy(next: { done: number; total: number } | null) {
    setUploading(next);
    onBusyChange?.(next !== null);
  }

  async function addFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;

    const cursor = cursorRef.current;

    setError("");
    setBusy({ done: 0, total: files.length });
    const uploaded: string[] = [];
    const failed: string[] = [];

    for (const file of files) {
      try {
        uploaded.push(imageMarkup(await uploadImage(file)));
      } catch {
        failed.push(file.name);
      }
      setBusy({ done: uploaded.length + failed.length, total: files.length });
    }

    if (uploaded.length > 0) {
      onChange(insertAtCursor(content, cursor, uploaded));
    }
    if (failed.length > 0) {
      setError(`No se pudieron subir: ${failed.join(", ")}. Revisa la conexión e inténtalo de nuevo.`);
    }
    setBusy(null);
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

  return (
    <section className="body-images" aria-labelledby="body-images-title">
      <div className="body-images-head">
        <div>
          <h3 id="body-images-title" className="body-images-title">
            Imágenes en el cuerpo <span className="segmented-count">{images.length}</span>
          </h3>
          <p className="form-hint">
            Puedes añadir varias a la vez. Se colocan después del párrafo donde dejaste el cursor; luego puedes moverlas.
          </p>
        </div>
        <label className={`button button--secondary file-button${uploading ? " is-disabled" : ""}`} htmlFor="body-images-input">
          <IconImage size={18} />
          {uploading ? `Subiendo ${uploading.done + 1 > uploading.total ? uploading.total : uploading.done + 1} de ${uploading.total}…` : "Añadir imágenes al cuerpo"}
        </label>
        <input
          id="body-images-input"
          className="visually-hidden"
          type="file"
          accept="image/*"
          multiple
          disabled={uploading !== null}
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <ol className="body-images-list">
          {images.map(({ index, block }, order) => (
            <li key={`${block.src}-${index}`} className="body-image">
              <span className="body-image-thumb">
                <SafeImage src={block.src} label={String(order + 1)} sizes="128px" />
              </span>
              <div className="body-image-main">
                <div className="field">
                  <label htmlFor={`body-caption-${index}`}>
                    Pie de foto {order + 1} <span className="field-optional">{positionLabel(index)}</span>
                  </label>
                  <input
                    id={`body-caption-${index}`}
                    type="text"
                    value={block.caption}
                    placeholder="Describe la imagen o indica el crédito"
                    onChange={(event) => update(index, imageMarkup(block.src, event.target.value))}
                  />
                </div>
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
                    aria-label={`Quitar imagen ${order + 1} del cuerpo`}
                    onClick={() => update(index, null)}
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="body-images-empty">Todavía no hay imágenes dentro del texto.</p>
      )}
    </section>
  );
}
