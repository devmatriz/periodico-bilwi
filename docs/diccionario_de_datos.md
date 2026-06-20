# Diccionario de datos - Bilwi Noticias

Este diccionario describe el modelo de datos real del proyecto. Se divide en:

1. Entidades relacionales principales de PostgreSQL.
2. Estructuras de apoyo guardadas en JSON para administracion y moderacion.

## 1. Entidades relacionales principales

### Tabla: `User`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `id` | String | PK | No | Identificador unico del usuario. |
| `name` | String |  | Si | Nombre visible del usuario. |
| `email` | String | UQ | No | Correo unico de acceso o referencia. |
| `role` | Enum `UserRole` |  | No | Rol del usuario: `ADMIN` o `EDITOR`. |
| `createdAt` | DateTime |  | No | Fecha y hora de creacion. |
| `updatedAt` | DateTime |  | No | Fecha y hora de ultima actualizacion. |

### Tabla: `Category`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `id` | String | PK | No | Identificador unico de la categoria. |
| `name` | String | UQ | No | Nombre legible de la categoria. |
| `slug` | String | UQ | No | Identificador amigable para rutas. |
| `createdAt` | DateTime |  | No | Fecha y hora de creacion. |
| `updatedAt` | DateTime |  | No | Fecha y hora de ultima actualizacion. |

### Tabla: `Tag`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `id` | String | PK | No | Identificador unico de la etiqueta. |
| `name` | String | UQ | No | Nombre visible de la etiqueta. |
| `slug` | String | UQ | No | Identificador amigable de la etiqueta. |
| `createdAt` | DateTime |  | No | Fecha de creacion. |
| `updatedAt` | DateTime |  | No | Fecha de actualizacion. |

### Tabla: `Image`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `id` | String | PK | No | Identificador unico de la imagen. |
| `url` | String |  | No | Ruta o URL del recurso grafico. |
| `alt` | String |  | Si | Texto alternativo para accesibilidad. |
| `caption` | String |  | Si | Pie de foto o descripcion breve. |
| `createdAt` | DateTime |  | No | Fecha de carga o registro. |
| `updatedAt` | DateTime |  | No | Fecha de modificacion. |

### Tabla: `Post`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `id` | String | PK | No | Identificador unico de la noticia. |
| `title` | String |  | No | Titular principal de la noticia. |
| `slug` | String | UQ | No | Ruta unica de la noticia. |
| `excerpt` | String |  | Si | Resumen breve o adelanto. |
| `content` | String |  | No | Cuerpo completo de la noticia. |
| `status` | Enum `PostStatus` |  | No | Estado: `DRAFT`, `PUBLISHED` o `ARCHIVED`. |
| `publishedAt` | DateTime |  | Si | Fecha de publicacion. |
| `createdAt` | DateTime |  | No | Fecha de creacion. |
| `updatedAt` | DateTime |  | No | Fecha de ultima modificacion. |
| `authorId` | String | FK | Si | Relacion con `User.id`. |
| `categoryId` | String | FK | Si | Relacion con `Category.id`. |
| `imageId` | String | FK | Si | Relacion con `Image.id`. |

### Tabla: `PostTag`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `postId` | String | PK, FK | No | Relacion con `Post.id`. |
| `tagId` | String | PK, FK | No | Relacion con `Tag.id`. |

## 2. Estructuras de apoyo en JSON

### Archivo: `data/comments.json`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `id` | String | PK funcional | No | Identificador unico del comentario. |
| `slug` | String |  | No | Slug de la noticia comentada. |
| `articleTitle` | String |  | No | Titulo de la noticia asociada. |
| `name` | String |  | No | Nombre del autor del comentario. |
| `email` | String |  | Si | Correo de contacto del comentarista. |
| `message` | String |  | No | Texto del comentario. |
| `status` | Enum |  | No | Estado de moderacion: `pending`, `approved`, `rejected` o `spam`. |
| `createdAt` | String ISO |  | No | Fecha de creacion. |
| `updatedAt` | String ISO |  | No | Fecha de actualizacion. |
| `moderatedAt` | String ISO |  | Si | Fecha de moderacion. |
| `moderator` | String |  | Si | Usuario o sistema que moderó. |

### Archivo: `data/admin-auth.json`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `id` | String | PK funcional | No | Identificador de la cuenta de admin. |
| `name` | String |  | No | Nombre visible del administrador. |
| `email` | String | UQ | No | Correo de acceso. |
| `role` | String |  | No | Rol de autenticacion, por ejemplo `admin`. |
| `passwordSalt` | String |  | No | Sal usado para el hash de contrasena. |
| `passwordHash` | String |  | No | Hash seguro de la contrasena. |
| `active` | Boolean |  | No | Indica si la cuenta esta habilitada. |

### Archivo: `data/admin-categories.json`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `slug` | String | PK funcional | No | Identificador de la categoria administrable. |
| `active` | Boolean |  | No | Estado de activacion de la categoria. |
| `label` | String |  | No | Nombre visible corto. |
| `badge` | String |  | No | Etiqueta destacada de la categoria. |
| `title` | String |  | No | Titulo editorial de la seccion. |
| `description` | String |  | No | Descripcion de la categoria. |
| `chips` | Array de String |  | No | Palabras o temas asociados. |
| `image` | String |  | No | Imagen representativa. |
| `background` | String |  | No | Gradiente o color de fondo. |

### Archivo: `data/admin-users.json`

| Campo | Tipo | Clave | Nulo | Descripcion |
|---|---|---:|---:|---|
| `id` | String | PK funcional | No | Identificador del usuario editorial. |
| `name` | String |  | No | Nombre completo del usuario. |
| `email` | String | UQ | No | Correo institucional. |
| `role` | String |  | No | Cargo o rol editorial. |
| `scope` | String |  | No | Ambito de trabajo. |
| `status` | String |  | No | Estado operativo del usuario. |
| `active` | Boolean |  | No | Indica si la cuenta esta activa. |
| `lastSeen` | String |  | No | Ultimo acceso o actividad registrada. |

## 3. Relaciones clave

- `User` 1 a N `Post`
- `Category` 1 a N `Post`
- `Image` 1 a N `Post`
- `Post` N a N `Tag` mediante `PostTag`
- Los comentarios se relacionan con la noticia mediante el campo `slug`

## 4. Observaciones

- El modelo relacional formal del proyecto se concentra en `User`, `Category`, `Tag`, `Image`, `Post` y `PostTag`.
- Los archivos JSON funcionan como capa de soporte para flujos ya visibles en la aplicacion.
- Si despues quieres migrar comentarios, usuarios editoriales o configuracion de categorias a PostgreSQL, este diccionario ya sirve como base para esa normalizacion.
