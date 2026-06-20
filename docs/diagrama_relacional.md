# Diagrama relacional - Bilwi Noticias

Este diagrama resume la estructura relacional principal del proyecto, basada en Prisma y PostgreSQL.
Las entidades de apoyo que hoy se guardan en JSON para administracion y moderacion se documentan aparte.

```mermaid
flowchart LR
  USER["User\nPK id\nUQ email\nrole"]
  CATEGORY["Category\nPK id\nUQ name\nUQ slug"]
  TAG["Tag\nPK id\nUQ name\nUQ slug"]
  IMAGE["Image\nPK id\nurl, alt, caption"]
  POST["Post\nPK id\nUQ slug\nauthorId, categoryId, imageId"]
  POSTTAG["PostTag\nPK (postId, tagId)"]

  USER -->|1:N authorId| POST
  CATEGORY -->|1:N categoryId| POST
  IMAGE -->|1:N imageId| POST
  POST -->|1:N| POSTTAG
  TAG -->|1:N| POSTTAG
```

## Cardinalidades

- Un `User` puede escribir muchas `Post`.
- Una `Category` puede agrupar muchas `Post`.
- Una `Image` puede relacionarse con muchas `Post`.
- Un `Post` puede tener muchos `Tag` mediante la tabla puente `PostTag`.
- Un `Tag` puede pertenecer a muchos `Post` mediante la tabla puente `PostTag`.

## Observacion

Los comentarios y parte de la administracion actual usan archivos JSON de soporte:

- `data/comments.json`
- `data/admin-auth.json`
- `data/admin-categories.json`
- `data/admin-users.json`

Esos archivos no forman parte del esquema relacional principal, pero si forman parte del flujo funcional del proyecto.
