import Link from "next/link";
import { SafeImage } from "@/components/story-image";
import type { NewsItem } from "@/lib/content-store";
import { cleanAuthor, displayCategory, formatShortDate, sectionForCategory, storyDate, tileNumber } from "@/lib/sections";

export function Tile({ index, size = "md" }: { index: number; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`tile tile--${size}`} aria-hidden="true">
      {tileNumber(index)}
    </span>
  );
}

// La etiqueta única de cada nota: sección · fecha · autor. Va debajo del titular.
export function StoryLabel({ story, author = false, link = false }: { story: NewsItem; author?: boolean; link?: boolean }) {
  const section = sectionForCategory(story.category);
  const date = storyDate(story);

  return (
    <p className="story-label">
      {link ? (
        <Link className="story-label-section" href={section.href}>
          {displayCategory(story.category)}
        </Link>
      ) : (
        <span className="story-label-section">{displayCategory(story.category)}</span>
      )}
      <span aria-hidden="true">·</span>
      <time dateTime={date}>{formatShortDate(date)}</time>
      {author ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{cleanAuthor(story.author)}</span>
        </>
      ) : null}
    </p>
  );
}

export function StoryImage({ story, sizes = "100vw", priority = false }: { story: NewsItem; sizes?: string; priority?: boolean }) {
  return <SafeImage className="story-image" src={story.image} label={displayCategory(story.category)} sizes={sizes} priority={priority} />;
}

/** Nota en lista: miniatura a la izquierda en móvil, arriba en columnas anchas cuando `stacked`. */
export function StoryRow({
  story,
  stacked = false,
  excerpt = true,
  headingLevel = 3,
}: {
  story: NewsItem;
  stacked?: boolean;
  excerpt?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className={`story-row${stacked ? " story-row--stacked" : ""}`}>
      <Link className="story-row-media" href={`/noticias/${story.slug}`} tabIndex={-1} aria-hidden="true">
        <StoryImage
          story={story}
          sizes={stacked ? "(min-width: 1080px) 400px, (min-width: 640px) 50vw, 100vw" : "(min-width: 720px) 240px, 112px"}
        />
      </Link>
      <div className="story-row-body">
        <Heading className="story-headline">
          <Link href={`/noticias/${story.slug}`}>{story.title}</Link>
        </Heading>
        {excerpt && story.excerpt ? <p className="story-excerpt">{story.excerpt}</p> : null}
        <StoryLabel story={story} />
      </div>
    </article>
  );
}
