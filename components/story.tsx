import Link from "next/link";
import { SafeImage } from "@/components/story-image";
import { dictionaries } from "@/lib/dictionaries";
import { categoryName } from "@/lib/localize";
import type { LocalizedStory } from "@/lib/localize";
import { localePath } from "@/lib/i18n";
import { cleanAuthor, formatShortDate, sectionForCategory, storyDate, tileNumber } from "@/lib/sections";

export function Tile({ index, size = "md" }: { index: number; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`tile tile--${size}`} aria-hidden="true">
      {tileNumber(index)}
    </span>
  );
}

// La etiqueta única de cada nota: sección · fecha · autor. Va debajo del titular.
export function StoryLabel({ story, author = false, link = false }: { story: LocalizedStory; author?: boolean; link?: boolean }) {
  const section = sectionForCategory(story.category);
  const date = storyDate(story);
  const name = categoryName(story.category, story.locale);

  return (
    <p className="story-label">
      {link ? (
        <Link className="story-label-section" href={localePath(story.locale, section.href)}>
          {name}
        </Link>
      ) : (
        <span className="story-label-section">{name}</span>
      )}
      <span aria-hidden="true">·</span>
      <time dateTime={date}>{formatShortDate(date, story.locale)}</time>
      {author ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{cleanAuthor(story.author)}</span>
        </>
      ) : null}
      {story.untranslated ? (
        <>
          <span aria-hidden="true">·</span>
          <span className="story-label-lang">{dictionaries[story.locale].common.inSpanish}</span>
        </>
      ) : null}
    </p>
  );
}

export function StoryImage({ story, sizes = "100vw", priority = false }: { story: LocalizedStory; sizes?: string; priority?: boolean }) {
  return (
    <SafeImage
      className="story-image"
      src={story.image}
      label={categoryName(story.category, story.locale)}
      sizes={sizes}
      priority={priority}
    />
  );
}

/** Idioma real del texto de una noticia (español si todavía no está traducida). */
export function storyLang(story: LocalizedStory) {
  return story.untranslated ? "es" : undefined;
}

/** Nota en lista: miniatura a la izquierda en móvil, arriba en columnas anchas cuando `stacked`. */
export function StoryRow({
  story,
  stacked = false,
  excerpt = true,
  headingLevel = 3,
}: {
  story: LocalizedStory;
  stacked?: boolean;
  excerpt?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className={`story-row${stacked ? " story-row--stacked" : ""}`}>
      <Link className="story-row-media" href={story.href} tabIndex={-1} aria-hidden="true">
        <StoryImage
          story={story}
          sizes={stacked ? "(min-width: 1080px) 400px, (min-width: 640px) 50vw, 100vw" : "(min-width: 720px) 240px, 112px"}
        />
      </Link>
      <div className="story-row-body">
        <Heading className="story-headline" lang={storyLang(story)}>
          <Link href={story.href}>{story.title}</Link>
        </Heading>
        {excerpt && story.excerpt ? (
          <p className="story-excerpt" lang={storyLang(story)}>
            {story.excerpt}
          </p>
        ) : null}
        <StoryLabel story={story} />
      </div>
    </article>
  );
}
