# Diagrama entidad relacion - Bilwi Noticias

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string email UK
        enum role
        datetime createdAt
        datetime updatedAt
    }

    CATEGORY {
        string id PK
        string name UK
        string slug UK
        datetime createdAt
        datetime updatedAt
    }

    TAG {
        string id PK
        string name UK
        string slug UK
        datetime createdAt
        datetime updatedAt
    }

    IMAGE {
        string id PK
        string url
        string alt
        string caption
        datetime createdAt
        datetime updatedAt
    }

    POST {
        string id PK
        string title
        string slug UK
        string excerpt
        string content
        enum status
        datetime publishedAt
        datetime createdAt
        datetime updatedAt
        string authorId FK
        string categoryId FK
        string imageId FK
    }

    POST_TAG {
        string postId PK, FK
        string tagId PK, FK
    }

    USER ||--o{ POST : escribe
    CATEGORY ||--o{ POST : clasifica
    IMAGE ||--o{ POST : ilustra
    POST ||--o{ POST_TAG : contiene
    TAG ||--o{ POST_TAG : agrupa
```

## Lectura del modelo

- `USER` representa a los autores o administradores que crean contenido.
- `CATEGORY` representa la seccion editorial de una noticia.
- `TAG` permite etiquetar noticias con temas o palabras clave.
- `IMAGE` almacena la imagen principal o de apoyo de la noticia.
- `POST` es la entidad central del periodico digital.
- `POST_TAG` resuelve la relacion muchos-a-muchos entre noticias y etiquetas.

## Notas de negocio

- `authorId`, `categoryId` e `imageId` son opcionales en el esquema actual.
- `slug` identifica de forma unica cada noticia.
- `status` controla si una noticia esta en borrador, publicada o archivada.
- La moderacion de comentarios se maneja fuera de este ER principal en un almacenamiento JSON de apoyo.
