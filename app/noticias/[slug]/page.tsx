import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { PublicShell } from "@/components/public-shell";
import { StoryRow } from "@/components/story";
import { SafeImage } from "@/components/story-image";
import { parseBlock, splitParagraphs } from "@/lib/article-body";
import { IconArrowRight } from "@/components/icons";
import { getCommentsForSlug } from "@/lib/comment-store";
import { getNoticiaBySlug, getPublicNoticias } from "@/lib/content-store";
import { cleanAuthor, displayCategory, formatArticleDate, sectionForCategory, storiesForSection, storyDate } from "@/lib/sections";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNoticiaBySlug(slug);

  if (!article) {
    return { title: "Noticia no encontrada" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      images: article.image ? [{ url: article.image }] : undefined,
      publishedTime: storyDate(article),
      authors: [cleanAuthor(article.author)],
      section: article.category,
    },
  };
}

function commentTime(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    timeZone: "America/Managua",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function NoticiaDetallePage({ params }: Props) {
  const { slug } = await params;
  const article = await getNoticiaBySlug(slug);

  if (!article) {
    notFound();
  }

  const [comments, stories] = await Promise.all([
    getCommentsForSlug(slug, { status: "approved" }),
    getPublicNoticias(),
  ]);

  const section = sectionForCategory(article.category);
  const others = stories.filter((story) => story.slug !== article.slug);
  const sameSection = storiesForSection(others, section.slug);
  const related = [...sameSection, ...others.filter((story) => !sameSection.includes(story))].slice(0, 3);

  const paragraphs = splitParagraphs(article.content);
  // Un resumen corto va como entradilla; uno largo abre el cuerpo para no empujar la foto fuera de la pantalla.
  const deck = article.excerpt && article.excerpt.length <= 280 ? article.excerpt : "";
  const withoutRepeat = paragraphs[0] === article.excerpt ? paragraphs.slice(1) : paragraphs;
  const body = (!deck && article.excerpt ? [article.excerpt, ...withoutRepeat] : withoutRepeat).map(parseBlock);
  const bodyImages = body.flatMap((block) => (block.type === "image" ? [block.src] : []));

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const url = `${protocol}://${host}/noticias/${article.slug}`;
  const shareText = encodeURIComponent(`${article.title} ${url}`);
  const published = storyDate(article);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [article.image, ...bodyImages]
      .filter(Boolean)
      .map((src) => (src.startsWith("http") ? src : `${protocol}://${host}${src}`)),
    datePublished: published,
    dateModified: article.updatedAt,
    author: [{ "@type": "Person", name: cleanAuthor(article.author) }],
    publisher: { "@type": "Organization", name: "Bilwi Noticias" },
    articleSection: article.category,
    mainEntityOfPage: url,
  };

  return (
    <PublicShell compact>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="article">
        <header className="article-head wrap">
          <nav className="breadcrumb" aria-label="Ruta">
            <Link href="/">Portada</Link>
            <span aria-hidden="true">/</span>
            <Link href={section.href}>{section.label}</Link>
          </nav>
          <h1 className="article-title">{article.title}</h1>
          {deck ? <p className="article-standfirst">{deck}</p> : null}
          <div className="article-byline">
            <span className="article-author">{cleanAuthor(article.author)}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={published}>{formatArticleDate(published)}</time>
            <span aria-hidden="true">·</span>
            <Link className="article-category" href={section.href}>
              {displayCategory(article.category)}
            </Link>
          </div>
        </header>

        <figure className="article-figure wrap">
          <div className="article-figure-media">
            <SafeImage
            src={article.image}
            label={displayCategory(article.category)}
            priority
              sizes="(min-width: 1180px) 1100px, 100vw"
            />
          </div>
        </figure>

        <div className="article-body-wrap wrap">
          <div className="article-body">
            {body.map((block, index) =>
              block.type === "image" ? (
                <figure key={`${article.slug}-${index}`} className="article-inline-figure">
                  <SafeImage
                    src={block.src}
                    alt={block.caption}
                    label={displayCategory(article.category)}
                    fill={false}
                    sizes="(min-width: 860px) 760px, 100vw"
                  />
                  {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                </figure>
              ) : (
                <p key={`${article.slug}-${index}`}>{block.text}</p>
              ),
            )}
          </div>

          <aside className="share" aria-label="Compartir">
            <h2 className="share-title">Compartir</h2>
            <ul>
              <li>
                <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  X
                </a>
              </li>
            </ul>
          </aside>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="related" aria-labelledby="relacionadas">
          <div className="wrap">
            <header className="front-section-head">
              <h2 id="relacionadas">Sigue leyendo</h2>
              <Link className="text-link" href={section.href}>
                Más de {section.label} <IconArrowRight size={16} />
              </Link>
            </header>
            <div className="related-grid">
              {related.map((story) => (
                <StoryRow key={story.slug} story={story} stacked excerpt={false} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="comments wrap" aria-labelledby="comentarios">
        <div className="comments-inner">
          <h2 id="comentarios">
            Comentarios <span className="comments-count">{comments.length}</span>
          </h2>

          {comments.length > 0 ? (
            <ol className="comment-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comment">
                  <span className="comment-avatar" aria-hidden="true">
                    {comment.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="comment-meta">
                      <strong>{comment.name}</strong>
                      <time dateTime={comment.createdAt}>{commentTime(comment.createdAt)}</time>
                    </p>
                    <p className="comment-text">{comment.message}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="comments-empty">Todavía no hay comentarios publicados. Sé la primera persona en opinar.</p>
          )}

          <h3 className="comment-form-title">Deja tu comentario</h3>
          <CommentForm slug={article.slug} articleTitle={article.title} />
        </div>
      </section>
    </PublicShell>
  );
}
