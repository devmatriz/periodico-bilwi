// El cuerpo de una noticia es texto plano: párrafos separados por una línea en blanco.
// Una imagen ocupa su propio párrafo con la forma ![pie de foto](url) y un video de YouTube
// o Facebook la forma !video[pie](enlace), así no cambia el formato guardado ni la API.

export type BodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; caption: string }
  | { type: "video"; url: string; caption: string };

const imagePattern = /^!\[([^\]]*)\]\(\s*(\S+?)\s*\)$/;
const videoPattern = /^!video\[([^\]]*)\]\(\s*(\S+?)\s*\)$/;

export function splitParagraphs(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseBlock(paragraph: string): BodyBlock {
  const video = paragraph.match(videoPattern);
  if (video) {
    return { type: "video", url: video[2], caption: video[1].trim() };
  }

  const image = paragraph.match(imagePattern);
  if (image) {
    return { type: "image", src: image[2], caption: image[1].trim() };
  }

  return { type: "paragraph", text: paragraph };
}

export function parseBody(content: string): BodyBlock[] {
  return splitParagraphs(content).map(parseBlock);
}

// Corchetes en el pie romperían la marca; se cambian por paréntesis.
function safeCaption(caption: string) {
  return caption.replace(/[[\]]/g, (char) => (char === "[" ? "(" : ")")).replace(/\s*\n\s*/g, " ");
}

export function imageMarkup(src: string, caption = "") {
  return `![${safeCaption(caption)}](${src})`;
}

export function videoMarkup(url: string, caption = "") {
  // Espacios y paréntesis cortarían el enlace: se codifican.
  const safeUrl = url.trim().replace(/\s/g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
  return `!video[${safeCaption(caption)}](${safeUrl})`;
}

export function joinParagraphs(paragraphs: string[]) {
  return paragraphs.join("\n\n");
}
