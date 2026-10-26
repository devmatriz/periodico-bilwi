"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { SafeImage } from "@/components/story-image";
import { IconImage, IconTrash, IconVideo } from "@/components/icons";
import { imageMarkup, joinParagraphs, parseBlock, splitParagraphs, videoMarkup } from "@/lib/article-body";
import type { BodyBlock } from "@/lib/article-body";
import { uploadImage } from "@/lib/upload-image";
import { parseVideoUrl } from "@/lib/video";

type Props = {
  content: string;
  onChange: (content: string) => void;
  /** Última posición del cursor en el texto; null si nunca se tocó (se añade al final). */
  cursorRef: RefObject<number | null>;
  onBusyChange?: (busy: boolean) => void;
};

type MediaBlock = Exclude<BodyBlock, { type: "paragraph" }>;

const VIDEO_HINT = "Pega un enlace de YouTube o Facebook (videos, Shorts o Reels).";

/** Videos del cuerpo cuyo enlace no es de YouTube ni de Facebook. */
export function invalidVideoLinks(content: string) {
  return splitParagraphs(content)
    .map(parseBlock)
    .filter((block) => block.type === "video" && !parseVideoUrl(block.url)).length;
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
  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");

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

  function addVideo() {
    const source = parseVideoUrl(videoUrl);
    if (!source) {
      setVideoError(`Ese enlace no es un video de YouTube ni de Facebook. ${VIDEO_HINT}`);
      return;
    }
    onChange(insertAtCursor(content, cursorRef.current, [videoMarkup(source.url)]));
    setVideoUrl("");
    setVideoError("");
    setVideoFormOpen(false);
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
  let videoNumber = 0;

  return (
    <section className="body-images" aria-labelledby="body-images-title">
      <div className="body-images-head">
        <div>
          <h3 id="body-images-title" className="body-images-title">
            Imágenes y videos en el cuerpo <span className="segmented-count">{media.length}</span>
          </h3>
          <p className="form-hint">
            Se colocan después del párrafo donde dejaste el cursor; luego puedes moverlos. Los videos se enlazan desde
            YouTube o Facebook y no ocupan espacio en el servidor.
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
          <button
            className="button button--secondary"
            type="button"
            aria-expanded={videoFormOpen}
            aria-controls="body-video-form"
            onClick={() => {
              setVideoFormOpen((open) => !open);
              setVideoError("");
            }}
          >
            <IconVideo size={18} />
            Añadir video
          </button>
        </div>
      </div>

      {videoFormOpen ? (
        <div id="body-video-form" className="body-video-form">
          <div className="field">
            <label htmlFor="body-video-url">
              Enlace del video <span className="field-optional">{VIDEO_HINT}</span>
            </label>
            <div className="body-video-row">
              <input
                id="body-video-url"
                type="url"
                inputMode="url"
                autoFocus
                value={videoUrl}
                placeholder="https://www.youtube.com/watch?v=…"
                aria-invalid={videoError ? true : undefined}
                aria-describedby={videoError ? "body-video-error" : undefined}
                onChange={(event) => {
                  setVideoUrl(event.target.value);
                  if (videoError) setVideoError("");
                }}
                onKeyDown={(event) => {
                  // Enter inserta el video en lugar de enviar el formulario de la noticia.
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addVideo();
                  }
                }}
              />
              <button className="button button--primary" type="button" onClick={addVideo} disabled={!videoUrl.trim()}>
                Insertar
              </button>
            </div>
            {videoError ? (
              <p id="body-video-error" className="field-error">
                {videoError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

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
            const isVideo = block.type === "video";
            const number = isVideo ? ++videoNumber : ++imageNumber;
            const label = isVideo ? `video ${number}` : `imagen ${number}`;
            const source = block.type === "video" ? parseVideoUrl(block.url) : null;

            return (
              <li key={`${block.type === "video" ? block.url : block.src}-${index}`} className={`body-image${isVideo ? " body-image--video" : ""}`}>
                <span className="body-image-thumb">
                  {block.type === "video" ? (
                    source?.thumbnail ? (
                      <SafeImage src={source.thumbnail} label="Video" sizes="128px" />
                    ) : (
                      <span className="image-fallback">{source?.platform ?? "Video"}</span>
                    )
                  ) : (
                    <SafeImage src={block.src} label={String(number)} sizes="128px" />
                  )}
                  {isVideo ? (
                    <span className="body-image-kind">
                      <IconVideo size={14} /> {source?.platform ?? "Video"}
                    </span>
                  ) : null}
                </span>
                <div className="body-image-main">
                  <div className="field">
                    <label htmlFor={`body-caption-${index}`}>
                      {isVideo ? `Pie del video ${number}` : `Pie de foto ${number}`}{" "}
                      <span className="field-optional">{positionLabel(index)}</span>
                    </label>
                    <input
                      id={`body-caption-${index}`}
                      type="text"
                      value={block.caption}
                      placeholder={isVideo ? "Qué muestra el video" : "Describe la imagen o indica el crédito"}
                      onChange={(event) =>
                        update(
                          index,
                          block.type === "video"
                            ? videoMarkup(block.url, event.target.value)
                            : imageMarkup(block.src, event.target.value),
                        )
                      }
                    />
                  </div>

                  {block.type === "video" ? (
                    <div className="field">
                      <label htmlFor={`body-video-${index}`}>
                        Enlace{" "}
                        <span className="field-optional">
                          {source ? `se mostrará el reproductor de ${source.platform}` : "debe ser de YouTube o Facebook"}
                        </span>
                      </label>
                      <input
                        id={`body-video-${index}`}
                        type="url"
                        inputMode="url"
                        value={block.url}
                        aria-invalid={!source || undefined}
                        aria-describedby={!source ? `body-video-error-${index}` : undefined}
                        onChange={(event) => update(index, videoMarkup(event.target.value, block.caption))}
                      />
                      {!source ? (
                        <p id={`body-video-error-${index}`} className="field-error">
                          Este enlace no es un video de YouTube ni de Facebook. Corrígelo o quita el video para publicar.
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
                    {source ? (
                      <a className="button button--ghost button--small" href={source.url} target="_blank" rel="noopener noreferrer">
                        Abrir en {source.platform}
                      </a>
                    ) : null}
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
        <p className="body-images-empty">Todavía no hay imágenes ni videos dentro del texto.</p>
      )}
    </section>
  );
}
