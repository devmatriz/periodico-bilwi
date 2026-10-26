// El cuerpo de una noticia es texto plano: párrafos separados por una línea en blanco.
// Una imagen ocupa su propio párrafo con la forma ![pie de foto](url) y un clip de video
// la forma !video[pie](url poster=url completo=url), así no cambia el formato guardado ni la API.

export type BodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; caption: string }
  | { type: "video"; src: string; caption: string; poster: string; full: string };

const imagePattern = /^!\[([^\]]*)\]\(\s*(\S+?)\s*\)$/;
const videoPattern = /^!video\[([^\]]*)\]\(\s*([^)]*?)\s*\)$/;

export function splitParagraphs(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseBlock(paragraph: string): BodyBlock {
  const video = paragraph.match(videoPattern);
  if (video) {
    const [src = "", ...options] = video[2].split(/\s+/).filter(Boolean);
    const read = (key: string) => options.find((option) => option.startsWith(`${key}=`))?.slice(key.length + 1) ?? "";
    return { type: "video", src, caption: video[1].trim(), poster: read("poster"), full: read("completo") };
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

export function videoMarkup(src: string, caption = "", poster = "", full = "") {
  const options = [src];
  if (poster) options.push(`poster=${poster}`);
  // Los espacios cortarían el enlace: se codifican.
  if (full) options.push(`completo=${full.trim().replace(/\s/g, "%20").replace(/\)/g, "%29")}`);
  return `!video[${safeCaption(caption)}](${options.join(" ")})`;
}

export function joinParagraphs(paragraphs: string[]) {
  return paragraphs.join("\n\n");
}
