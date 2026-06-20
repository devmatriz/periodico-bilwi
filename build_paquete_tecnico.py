from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"C:\Users\misae\OneDrive\Documents\Mi pagina\Periodico")
OUT_DIR = ROOT / "docs"
FIG_DIR = OUT_DIR / "figuras"
DOCX_PATH = OUT_DIR / "paquete_tecnico_bilwi_noticias.docx"
REL_IMG = FIG_DIR / "diagrama_relacional.png"
ER_IMG = FIG_DIR / "diagrama_er.png"


def font(size=24, bold=False):
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibri.ttf" if not bold else r"C:\Windows\Fonts\calibrib.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def wrap_text(draw, text, font_obj, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = word if not current else f"{current} {word}"
        bbox = draw.textbbox((0, 0), test, font=font_obj)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_box(draw, box, title, lines, fill, outline, title_color="#0B2545"):
    x1, y1, x2, y2 = box
    radius = 24
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=4)
    title_font = font(30, bold=True)
    body_font = font(20)
    inner_x = x1 + 24
    y = y1 + 20
    draw.text((inner_x, y), title, font=title_font, fill=title_color)
    y += 46
    for line in lines:
        wrapped = wrap_text(draw, line, body_font, x2 - inner_x - 20)
        for part in wrapped:
            draw.text((inner_x, y), part, font=body_font, fill="#20304A")
            y += 26
        y += 2


def draw_arrow(draw, start, end, label=None, label_pos=0.5):
    x1, y1 = start
    x2, y2 = end
    draw.line((x1, y1, x2, y2), fill="#264C7D", width=5)
    import math

    angle = math.atan2(y2 - y1, x2 - x1)
    size = 14
    p1 = (x2, y2)
    p2 = (x2 - size * math.cos(angle - math.pi / 6), y2 - size * math.sin(angle - math.pi / 6))
    p3 = (x2 - size * math.cos(angle + math.pi / 6), y2 - size * math.sin(angle + math.pi / 6))
    draw.polygon([p1, p2, p3], fill="#264C7D")
    if label:
        lx = x1 + (x2 - x1) * label_pos
        ly = y1 + (y2 - y1) * label_pos - 18
        label_font = font(18, bold=True)
        bbox = draw.textbbox((0, 0), label, font=label_font)
        pad = 8
        draw.rounded_rectangle(
            (lx - pad, ly - pad, lx + (bbox[2] - bbox[0]) + pad, ly + (bbox[3] - bbox[1]) + pad),
            radius=10,
            fill="#EAF1FB",
            outline="#B8C7DD",
            width=2,
        )
        draw.text((lx, ly), label, font=label_font, fill="#1F4D78")


def make_relational_diagram(path):
    img = Image.new("RGB", (2200, 1350), "white")
    draw = ImageDraw.Draw(img)
    title_font = font(42, bold=True)
    subtitle_font = font(24)
    draw.text((70, 40), "Diagrama relacional", font=title_font, fill="#0B2545")
    draw.text(
        (70, 96),
        "Estructura principal del modelo de datos en PostgreSQL y Prisma para Bilwi Noticias",
        font=subtitle_font,
        fill="#5A6475",
    )

    boxes = {
        "user": (90, 210, 500, 430),
        "category": (640, 210, 1050, 430),
        "tag": (1190, 210, 1600, 430),
        "image": (1740, 210, 2150, 430),
        "post": (610, 640, 1210, 960),
        "posttag": (1380, 690, 1950, 940),
    }

    draw_box(draw, boxes["user"], "User", ["PK id", "UQ email", "role", "createdAt / updatedAt"], "#F4F8FE", "#B7CAE8")
    draw_box(draw, boxes["category"], "Category", ["PK id", "UQ name", "UQ slug", "createdAt / updatedAt"], "#F4F8FE", "#B7CAE8")
    draw_box(draw, boxes["tag"], "Tag", ["PK id", "UQ name", "UQ slug", "createdAt / updatedAt"], "#F4F8FE", "#B7CAE8")
    draw_box(draw, boxes["image"], "Image", ["PK id", "url", "alt", "caption"], "#F4F8FE", "#B7CAE8")
    draw_box(
        draw,
        boxes["post"],
        "Post",
        ["PK id", "title, slug, excerpt", "content, status", "authorId, categoryId, imageId"],
        "#FFF9EF",
        "#E3C98D",
    )
    draw_box(
        draw,
        boxes["posttag"],
        "PostTag",
        ["PK (postId, tagId)", "FK postId", "FK tagId"],
        "#FFF9EF",
        "#E3C98D",
    )

    draw_arrow(draw, (500, 320), (610, 750), "1:N")
    draw_arrow(draw, (1050, 320), (760, 700), "1:N")
    draw_arrow(draw, (1395, 320), (1030, 700), "1:N")
    draw_arrow(draw, (1940, 430), (1840, 690), "1:N")
    draw_arrow(draw, (1210, 790), (1380, 790), "1:N")

    note_font = font(20, bold=True)
    draw.rounded_rectangle((70, 1080, 2130, 1288), radius=28, fill="#F7FAFD", outline="#D6E1EF", width=3)
    draw.text((100, 1115), "Relaciones clave", font=font(28, bold=True), fill="#1F4D78")
    notes = [
        "User 1:N Post",
        "Category 1:N Post",
        "Image 1:N Post",
        "Post 1:N PostTag",
        "Tag 1:N PostTag",
    ]
    x = 100
    y = 1160
    for note in notes:
        bbox = draw.textbbox((0, 0), note, font=note_font)
        draw.rounded_rectangle((x, y, x + (bbox[2] - bbox[0]) + 32, y + 40), radius=16, fill="#EAF1FB", outline="#B8C7DD", width=2)
        draw.text((x + 16, y + 8), note, font=note_font, fill="#20304A")
        x += (bbox[2] - bbox[0]) + 56

    img.save(path)


def make_er_diagram(path):
    img = Image.new("RGB", (2200, 1350), "white")
    draw = ImageDraw.Draw(img)
    title_font = font(42, bold=True)
    subtitle_font = font(24)
    draw.text((70, 40), "Diagrama entidad-relacion", font=title_font, fill="#0B2545")
    draw.text(
        (70, 96),
        "Vista conceptual de las entidades principales y sus cardinalidades",
        font=subtitle_font,
        fill="#5A6475",
    )

    boxes = {
        "user": (90, 210, 500, 430),
        "category": (640, 210, 1050, 430),
        "tag": (1190, 210, 1600, 430),
        "image": (1740, 210, 2150, 430),
        "post": (520, 640, 1250, 980),
        "posttag": (1420, 680, 2020, 960),
    }

    draw_box(draw, boxes["user"], "Entidad: Usuario", ["id", "name", "email", "role"], "#F4F8FE", "#B7CAE8")
    draw_box(draw, boxes["category"], "Entidad: Categoria", ["id", "name", "slug", "createdAt / updatedAt"], "#F4F8FE", "#B7CAE8")
    draw_box(draw, boxes["tag"], "Entidad: Etiqueta", ["id", "name", "slug", "createdAt / updatedAt"], "#F4F8FE", "#B7CAE8")
    draw_box(draw, boxes["image"], "Entidad: Imagen", ["id", "url", "alt", "caption"], "#F4F8FE", "#B7CAE8")
    draw_box(
        draw,
        boxes["post"],
        "Entidad: Noticia",
        ["id, title, slug", "excerpt, content", "status, publishedAt", "authorId, categoryId, imageId"],
        "#FFF9EF",
        "#E3C98D",
    )
    draw_box(
        draw,
        boxes["posttag"],
        "Entidad puente",
        ["postId", "tagId"],
        "#FFF9EF",
        "#E3C98D",
    )

    draw_arrow(draw, (500, 320), (520, 760), "1:N")
    draw_arrow(draw, (1050, 320), (920, 720), "1:N")
    draw_arrow(draw, (1395, 320), (1080, 720), "1:N")
    draw_arrow(draw, (1940, 430), (1820, 680), "1:N")
    draw_arrow(draw, (1250, 820), (1420, 820), "N:M")

    draw.rounded_rectangle((70, 1080, 2130, 1250), radius=28, fill="#F7FAFD", outline="#D6E1EF", width=3)
    draw.text((100, 1115), "Lectura conceptual", font=font(28, bold=True), fill="#1F4D78")
    lines = [
        "Un usuario crea muchas noticias.",
        "Cada noticia pertenece a una categoria.",
        "Una imagen puede reutilizarse en varias noticias.",
        "Las etiquetas se asignan mediante la entidad puente PostTag.",
    ]
    y = 1138
    body_font = font(19)
    for line in lines:
        draw.text((100, y), f"• {line}", font=body_font, fill="#20304A")
        y += 30

    img.save(path)


def set_style_font(style, *, name="Calibri", size=11, bold=False, italic=False, color=None):
    style.font.name = name
    style._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    style.font.size = Pt(size)
    style.font.bold = bold
    style.font.italic = italic
    if color is not None:
        style.font.color.rgb = RGBColor.from_string(color.replace("#", ""))


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill.replace("#", ""))
    tc_pr.append(shd)


def set_table_borders(table, color="D9E2F1", size="6"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = f"w:{edge}"
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_table_widths(table, widths):
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    for row in table.rows:
        for idx, width in enumerate(widths):
            row.cells[idx].width = Inches(width)


def set_cell_text(cell, text, *, bold=False, color=None, size=10, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    run = p.add_run(text)
    run.bold = bold
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color.replace("#", ""))


def add_heading(doc, text, level=1):
    p = doc.add_paragraph()
    if level == 1:
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor.from_string("2E74B5")
    elif level == 2:
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor.from_string("1F4D78")
    else:
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor.from_string("1F4D78")
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")


def bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")


def add_table(doc, headers, rows, widths, header_fill="1F4D78"):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_widths(table, widths)
    set_table_borders(table)
    for idx, header in enumerate(headers):
        set_cell_text(table.rows[0].cells[idx], header, bold=True, color="FFFFFF", size=10)
        table.rows[0].cells[idx].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_shading(table.rows[0].cells[idx], header_fill)
    for row in rows:
        cells = table.add_row().cells
        for idx, value in enumerate(row):
            set_cell_text(cells[idx], value, size=10)
            cells[idx].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    return table


def build_docx():
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.49)
    section.footer_distance = Inches(0.49)

    normal = doc.styles["Normal"]
    set_style_font(normal, size=11)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.15

    for name, props in {
        "Heading 1": {"size": 16, "bold": True, "color": "2E74B5"},
        "Heading 2": {"size": 13, "bold": True, "color": "1F4D78"},
        "Heading 3": {"size": 12, "bold": True, "color": "1F4D78"},
    }.items():
        set_style_font(doc.styles[name], **props)

    doc.core_properties.title = "Paquete tecnico - Bilwi Noticias"
    doc.core_properties.subject = "Diagramas y diccionario de datos"
    doc.core_properties.author = "Codex"

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("Paquete tecnico del proyecto")
    run.bold = True
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    run.font.size = Pt(24)
    run.font.color.rgb = RGBColor.from_string("2E74B5")

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    srun = subtitle.add_run("Diagramas y diccionario de datos para el informe de Bilwi Noticias")
    srun.italic = True
    srun.font.name = "Calibri"
    srun._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    srun.font.size = Pt(11)
    srun.font.color.rgb = RGBColor.from_string("666666")

    meta = doc.add_table(rows=4, cols=2)
    meta.style = "Table Grid"
    meta.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_widths(meta, [1.7, 4.8])
    set_table_borders(meta, color="B8C7DD")
    meta_rows = [
        ("Proyecto", "Bilwi Noticias"),
        ("Contenido", "Diagrama relacional, diagrama entidad-relacion y diccionario de datos"),
        ("Formato", "Listo para insertar en un informe"),
        ("Fecha", "19 de junio de 2026"),
    ]
    for idx, (label, value) in enumerate(meta_rows):
        set_cell_text(meta.rows[idx].cells[0], label, bold=True, color="1F4D78", size=10)
        set_cell_text(meta.rows[idx].cells[1], value, size=10)
        set_cell_shading(meta.rows[idx].cells[0], "EAF1FB")

    add_heading(doc, "1. Diagramas", 1)

    add_heading(doc, "1.1 Diagrama relacional", 2)
    doc.add_picture(str(REL_IMG), width=Inches(6.8))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap_run = cap.add_run("Figura 1. Diagrama relacional del modelo principal de Bilwi Noticias.")
    cap_run.italic = True
    cap_run.font.size = Pt(9)
    cap_run.font.color.rgb = RGBColor.from_string("666666")

    add_heading(doc, "1.2 Diagrama entidad-relacion", 2)
    doc.add_picture(str(ER_IMG), width=Inches(6.8))
    cap2 = doc.add_paragraph()
    cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap2_run = cap2.add_run("Figura 2. Diagrama entidad-relacion del sistema editorial.")
    cap2_run.italic = True
    cap2_run.font.size = Pt(9)
    cap2_run.font.color.rgb = RGBColor.from_string("666666")

    add_heading(doc, "2. Diccionario de datos", 1)
    doc.add_paragraph(
        "El siguiente diccionario resume las entidades principales del esquema relacional y las estructuras de apoyo utilizadas por el proyecto.",
    )

    entities = [
        (
            "2.1 Tabla User",
            ["Campo", "Tipo", "Clave", "Nulo", "Descripcion"],
            [
                ["id", "String", "PK", "No", "Identificador unico del usuario."],
                ["name", "String", "", "Si", "Nombre visible del usuario."],
                ["email", "String", "UQ", "No", "Correo unico de acceso o referencia."],
                ["role", "Enum UserRole", "", "No", "Rol del usuario: ADMIN o EDITOR."],
                ["createdAt", "DateTime", "", "No", "Fecha y hora de creacion."],
                ["updatedAt", "DateTime", "", "No", "Fecha y hora de ultima actualizacion."],
            ],
            [1.0, 1.1, 0.7, 0.7, 3.0],
        ),
        (
            "2.2 Tabla Category",
            ["Campo", "Tipo", "Clave", "Nulo", "Descripcion"],
            [
                ["id", "String", "PK", "No", "Identificador unico de la categoria."],
                ["name", "String", "UQ", "No", "Nombre legible de la categoria."],
                ["slug", "String", "UQ", "No", "Identificador amigable para rutas."],
                ["createdAt", "DateTime", "", "No", "Fecha y hora de creacion."],
                ["updatedAt", "DateTime", "", "No", "Fecha y hora de ultima actualizacion."],
            ],
            [1.0, 1.1, 0.7, 0.7, 3.0],
        ),
        (
            "2.3 Tabla Tag",
            ["Campo", "Tipo", "Clave", "Nulo", "Descripcion"],
            [
                ["id", "String", "PK", "No", "Identificador unico de la etiqueta."],
                ["name", "String", "UQ", "No", "Nombre visible de la etiqueta."],
                ["slug", "String", "UQ", "No", "Identificador amigable de la etiqueta."],
                ["createdAt", "DateTime", "", "No", "Fecha de creacion."],
                ["updatedAt", "DateTime", "", "No", "Fecha de actualizacion."],
            ],
            [1.0, 1.1, 0.7, 0.7, 3.0],
        ),
        (
            "2.4 Tabla Image",
            ["Campo", "Tipo", "Clave", "Nulo", "Descripcion"],
            [
                ["id", "String", "PK", "No", "Identificador unico de la imagen."],
                ["url", "String", "", "No", "Ruta o URL del recurso grafico."],
                ["alt", "String", "", "Si", "Texto alternativo para accesibilidad."],
                ["caption", "String", "", "Si", "Pie de foto o descripcion breve."],
                ["createdAt", "DateTime", "", "No", "Fecha de carga o registro."],
                ["updatedAt", "DateTime", "", "No", "Fecha de modificacion."],
            ],
            [1.0, 1.1, 0.7, 0.7, 3.0],
        ),
        (
            "2.5 Tabla Post",
            ["Campo", "Tipo", "Clave", "Nulo", "Descripcion"],
            [
                ["id", "String", "PK", "No", "Identificador unico de la noticia."],
                ["title", "String", "", "No", "Titular principal de la noticia."],
                ["slug", "String", "UQ", "No", "Ruta unica de la noticia."],
                ["excerpt", "String", "", "Si", "Resumen breve o adelanto."],
                ["content", "String", "", "No", "Cuerpo completo de la noticia."],
                ["status", "Enum PostStatus", "", "No", "Estado: DRAFT, PUBLISHED o ARCHIVED."],
                ["publishedAt", "DateTime", "", "Si", "Fecha de publicacion."],
                ["createdAt", "DateTime", "", "No", "Fecha de creacion."],
                ["updatedAt", "DateTime", "", "No", "Fecha de ultima modificacion."],
                ["authorId", "String", "FK", "Si", "Relacion con User.id."],
                ["categoryId", "String", "FK", "Si", "Relacion con Category.id."],
                ["imageId", "String", "FK", "Si", "Relacion con Image.id."],
            ],
            [1.0, 1.1, 0.7, 0.7, 3.0],
        ),
        (
            "2.6 Tabla PostTag",
            ["Campo", "Tipo", "Clave", "Nulo", "Descripcion"],
            [
                ["postId", "String", "PK, FK", "No", "Relacion con Post.id."],
                ["tagId", "String", "PK, FK", "No", "Relacion con Tag.id."],
            ],
            [1.0, 1.1, 0.9, 0.7, 3.0],
        ),
    ]

    for heading, headers, rows, widths in entities:
        add_heading(doc, heading, 2)
        add_table(doc, headers, rows, widths)

    add_heading(doc, "3. Estructuras de apoyo en JSON", 1)
    support = [
        (
            "3.1 comments.json",
            [
                ["id", "String", "PK funcional", "No", "Identificador unico del comentario."],
                ["slug", "String", "", "No", "Slug de la noticia comentada."],
                ["articleTitle", "String", "", "No", "Titulo de la noticia asociada."],
                ["name", "String", "", "No", "Nombre del autor del comentario."],
                ["email", "String", "", "Si", "Correo de contacto del comentarista."],
                ["message", "String", "", "No", "Texto del comentario."],
                ["status", "Enum", "", "No", "pending, approved, rejected o spam."],
                ["createdAt", "String ISO", "", "No", "Fecha de creacion."],
                ["updatedAt", "String ISO", "", "No", "Fecha de actualizacion."],
                ["moderatedAt", "String ISO", "", "Si", "Fecha de moderacion."],
                ["moderator", "String", "", "Si", "Usuario o sistema que modero."],
            ],
            [1.0, 1.1, 0.9, 0.7, 3.0],
        ),
        (
            "3.2 admin-auth.json",
            [
                ["id", "String", "PK funcional", "No", "Identificador de la cuenta de admin."],
                ["name", "String", "", "No", "Nombre visible del administrador."],
                ["email", "String", "UQ", "No", "Correo de acceso."],
                ["role", "String", "", "No", "Rol de autenticacion, por ejemplo admin."],
                ["passwordSalt", "String", "", "No", "Sal usado para el hash de contrasena."],
                ["passwordHash", "String", "", "No", "Hash seguro de la contrasena."],
                ["active", "Boolean", "", "No", "Indica si la cuenta esta habilitada."],
            ],
            [1.0, 1.1, 0.9, 0.7, 3.0],
        ),
        (
            "3.3 admin-categories.json",
            [
                ["slug", "String", "PK funcional", "No", "Identificador de la categoria administrable."],
                ["active", "Boolean", "", "No", "Estado de activacion de la categoria."],
                ["label", "String", "", "No", "Nombre visible corto."],
                ["badge", "String", "", "No", "Etiqueta destacada de la categoria."],
                ["title", "String", "", "No", "Titulo editorial de la seccion."],
                ["description", "String", "", "No", "Descripcion de la categoria."],
                ["chips", "Array String", "", "No", "Palabras o temas asociados."],
                ["image", "String", "", "No", "Imagen representativa."],
                ["background", "String", "", "No", "Gradiente o color de fondo."],
            ],
            [1.0, 1.1, 0.9, 0.7, 3.0],
        ),
        (
            "3.4 admin-users.json",
            [
                ["id", "String", "PK funcional", "No", "Identificador del usuario editorial."],
                ["name", "String", "", "No", "Nombre completo del usuario."],
                ["email", "String", "UQ", "No", "Correo institucional."],
                ["role", "String", "", "No", "Cargo o rol editorial."],
                ["scope", "String", "", "No", "Ambito de trabajo."],
                ["status", "String", "", "No", "Estado operativo del usuario."],
                ["active", "Boolean", "", "No", "Indica si la cuenta esta activa."],
                ["lastSeen", "String", "", "No", "Ultimo acceso o actividad registrada."],
            ],
            [1.0, 1.1, 0.9, 0.7, 3.0],
        ),
    ]

    for heading, rows, widths in support:
        add_heading(doc, heading, 2)
        add_table(doc, ["Campo", "Tipo", "Clave", "Nulo", "Descripcion"], rows, widths)

    add_heading(doc, "4. Relaciones clave", 1)
    bullet(doc, "User 1 a N Post.")
    bullet(doc, "Category 1 a N Post.")
    bullet(doc, "Image 1 a N Post.")
    bullet(doc, "Post N a N Tag mediante PostTag.")
    bullet(doc, "Los comentarios se relacionan con la noticia mediante el campo slug.")

    add_heading(doc, "5. Observaciones", 1)
    bullet(doc, "El modelo relacional formal del proyecto se concentra en User, Category, Tag, Image, Post y PostTag.")
    bullet(doc, "Los archivos JSON funcionan como capa de soporte para flujos visibles en la aplicacion.")
    bullet(doc, "Si luego se migra comentarios o configuracion editorial a PostgreSQL, este diccionario ya sirve como base.")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc.save(DOCX_PATH)
    return DOCX_PATH


def main():
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    make_relational_diagram(REL_IMG)
    make_er_diagram(ER_IMG)
    path = build_docx()
    print(path)


if __name__ == "__main__":
    main()
