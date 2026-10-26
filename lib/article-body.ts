// El cuerpo de una noticia es texto plano: párrafos separados por una línea en blanco.
// Una imagen ocupa su propio párrafo con la forma ![pie de foto](url), así no cambia
// el formato guardado ni la API.

export type BodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; caption: string };

const imagePattern = /^!\[([^\]]*)\]\(\s*(\S+?)\s*\)$/;

export function splitParagraphs(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseBlock(paragraph: string): BodyBlock {
  const match = paragraph.match(imagePattern);
  if (match) {
    return { type: "image", src: match[2], caption: match[1].trim() };
  }
  return { type: "paragraph", text: paragraph };
}

export function parseBody(content: string): BodyBlock[] {
  return splitParagraphs(content).map(parseBlock);
}

export function imageMarkup(src: string, caption = "") {
  // Corchetes en el pie romperían la marca; se cambian por paréntesis.
  const safeCaption = caption.replace(/[[\]]/g, (char) => (char === "[" ? "(" : ")")).replace(/\s*\n\s*/g, " ");
  return `![${safeCaption}](${src})`;
}

export function joinParagraphs(paragraphs: string[]) {
  return paragraphs.join("\n\n");
}
