from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"C:\Users\misae\OneDrive\Documents\Mi pagina\Periodico")
OUTPUT = ROOT / "docs" / "manual_usuario_bilwi_noticias.docx"


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


def set_cell_text(cell, text, *, bold=False, color=None, size=11, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    paragraph.alignment = align
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color.replace("#", ""))


def set_table_borders(table, color="D9E2F1", size="6"):
    tbl = table._tbl
    tbl_pr = tbl.tblPr
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


def add_paragraph(doc, text, *, style="Normal", bold=False, color=None, size=None, align=None, space_after=None):
    p = doc.add_paragraph(style=style)
    if align is not None:
        p.alignment = align
    if space_after is not None:
        p.paragraph_format.space_after = Pt(space_after)
    run = p.add_run(text)
    run.bold = bold
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color.replace("#", ""))
    if size is not None:
        run.font.size = Pt(size)
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    return p


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
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    run.font.size = Pt(11)
    return p


def add_number(doc, text):
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    run.font.size = Pt(11)
    return p


def add_spacer(doc, points=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(points)
    return p


def create_table(doc, headers, rows, widths, header_fill="1F4D78"):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_widths(table, widths)
    set_table_borders(table)
    header_cells = table.rows[0].cells
    for idx, header in enumerate(headers):
        set_cell_text(header_cells[idx], header, bold=True, color="FFFFFF", size=10)
        header_cells[idx].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_shading(header_cells[idx], header_fill)

    for row in rows:
        cells = table.add_row().cells
        for idx, value in enumerate(row):
            set_cell_text(cells[idx], value, size=10)
            cells[idx].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    return table


def build_manual():
    doc = Document()

    # Page setup
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.49)
    section.footer_distance = Inches(0.49)

    # Base styles
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

    doc.core_properties.title = "Manual de usuario - Bilwi Noticias"
    doc.core_properties.subject = "Guía de uso del periódico digital"
    doc.core_properties.author = "Codex"
    doc.core_properties.comments = "Manual generado para el proyecto Bilwi Noticias."

    # Cover/title block
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(3)
    run = title.add_run("Manual de usuario")
    run.bold = True
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    run.font.size = Pt(24)
    run.font.color.rgb = RGBColor.from_string("2E74B5")

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.paragraph_format.space_after = Pt(10)
    subrun = subtitle.add_run("Bilwi Noticias - Periódico digital para información local, cultural y social")
    subrun.italic = True
    subrun.font.name = "Calibri"
    subrun._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    subrun.font.size = Pt(11)
    subrun.font.color.rgb = RGBColor.from_string("666666")

    meta = doc.add_table(rows=4, cols=2)
    meta.style = "Table Grid"
    meta.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_widths(meta, [1.7, 4.8])
    set_table_borders(meta, color="B8C7DD")
    meta_rows = [
        ("Proyecto", "Diseño e implementación de un periódico digital para Bilwi, Puerto Cabezas"),
        ("Versión del manual", "1.0"),
        ("Fecha", "19 de junio de 2026"),
        ("Alcance", "Uso del sitio público, acceso editorial y panel de administración"),
    ]
    for idx, (label, value) in enumerate(meta_rows):
        set_cell_text(meta.rows[idx].cells[0], label, bold=True, color="1F4D78", size=10)
        set_cell_text(meta.rows[idx].cells[1], value, size=10)
        meta.rows[idx].cells[0].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        meta.rows[idx].cells[1].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_shading(meta.rows[idx].cells[0], "EAF1FB")

    add_paragraph(
        doc,
        "Este documento explica cómo navegar el periódico, buscar noticias, leer contenidos, comentar, "
        "y administrar publicaciones desde el panel de editor o administrador.",
        space_after=10,
    )

    add_heading(doc, "1. Introducción", 1)
    add_paragraph(
        doc,
        "Bilwi Noticias es una plataforma digital pensada para publicar información local, cultural y social "
        "de Bilwi, Puerto Cabezas. El sitio combina una portada editorial, secciones temáticas, lectura de "
        "noticias individuales y un panel administrativo para la gestión de contenidos.",
    )
    add_paragraph(
        doc,
        "El sistema está organizado para que un lector pueda entrar y consultar noticias rápidamente, mientras "
        "que el equipo editorial puede publicar, moderar y mantener actualizada la información.",
    )

    add_heading(doc, "2. Requisitos para usar la plataforma", 1)
    add_bullet(doc, "Tener un navegador moderno como Chrome, Edge, Firefox o Safari.")
    add_bullet(doc, "Abrir el proyecto desde un servidor local o desde su dominio de publicación.")
    add_bullet(doc, "Para tareas de edición, contar con una cuenta de administrador o editor.")
    add_bullet(doc, "Si el sitio se ejecuta en desarrollo, iniciar el servidor con `npm run dev` y abrir `http://localhost:3002/`.")

    add_heading(doc, "3. Estructura general del sitio", 1)
    create_table(
        doc,
        ["Ruta", "Uso principal"],
        [
            ["/", "Portada con noticia destacada, cinta de último minuto y accesos rápidos a secciones."],
            ["/noticias", "Listado de noticias con búsqueda, filtro por categoría y filtro por periodo."],
            ["/noticias/[slug]", "Lectura completa de una noticia, comentarios aprobados y formulario de comentario."],
            ["/categorias", "Vista general de las secciones editoriales del periódico."],
            ["/nosotros", "Información institucional, misión y presentación del medio."],
            ["/contacto", "Formulario para mensajes, contacto o sugerencias de noticia."],
            ["/login", "Acceso al panel administrativo o editorial."],
            ["/registro", "Registro de usuario cuando el flujo esté habilitado para lectores."],
            [
                "Páginas complementarias",
                " /politica-privacidad, /terminos, /publicidad, /mapa y secciones temáticas como "
                "/locales, /cultura, /deportes, /economia, /sociedad, /opinion y /etica.",
            ],
        ],
        [1.9, 4.6],
    )

    add_heading(doc, "4. Cómo usar el sitio público", 1)
    add_heading(doc, "4.1 Portada", 2)
    add_bullet(doc, "La parte superior muestra el nombre del periódico y los accesos de navegación.")
    add_bullet(doc, "La cinta de `ULTIMO MINUTO` se actualiza automáticamente con noticias cortas y el horario del momento.")
    add_bullet(doc, "La portada destaca la noticia principal y muestra tarjetas con otras publicaciones relevantes.")
    add_bullet(doc, "Las secciones rápidas permiten entrar a categorías como Locales, Cultura, Deportes y Economía.")

    add_heading(doc, "4.2 Listado de noticias", 2)
    add_number(doc, "Entrar a la ruta `/noticias`.")
    add_number(doc, "Usar el buscador para localizar un tema, persona o palabra clave.")
    add_number(doc, "Aplicar filtros por categoría o por periodo de publicación.")
    add_number(doc, "Abrir la noticia que desee para leer el contenido completo.")

    add_heading(doc, "4.3 Lectura de una noticia", 2)
    add_bullet(doc, "Cada noticia muestra título, imagen, autor, fecha y contenido completo.")
    add_bullet(doc, "Al final del artículo aparecen los comentarios aprobados por el equipo editorial.")
    add_bullet(doc, "Si el lector desea participar, puede dejar un comentario desde el formulario inferior.")

    add_heading(doc, "4.4 Contacto con la redacción", 2)
    add_bullet(doc, "Use `/contacto` para escribir mensajes generales o sugerir temas.")
    add_bullet(doc, "Use el formulario con información clara para que el equipo pueda responder con rapidez.")

    add_heading(doc, "5. Cómo usar el panel administrativo", 1)
    add_paragraph(
        doc,
        "El panel administrativo centraliza el trabajo editorial: crear noticias, clasificar contenido, "
        "moderar comentarios y mantener ordenadas las secciones del periódico.",
    )

    add_heading(doc, "5.1 Acceso al sistema", 2)
    add_number(doc, "Abrir la ruta `/login`.")
    add_number(doc, "Ingresar su correo y contraseña de administrador.")
    add_number(doc, "Si la sesión es válida, el sistema redirige automáticamente a `/admin`.")
    add_number(doc, "Desde la barra superior puede cerrar sesión cuando termine de trabajar.")
    add_paragraph(
        doc,
        "Credenciales de prueba en desarrollo: usuario `admin@bilwi.ni` y contraseña `Bilwi2026!`.",
    )

    add_heading(doc, "5.2 Dashboard", 2)
    add_bullet(doc, "Muestra totales de noticias, borradores, destacadas, categorías y actividad reciente.")
    add_bullet(doc, "Sirve como vista rápida para entender el estado del periódico.")

    add_heading(doc, "5.3 Gestión de noticias", 2)
    add_number(doc, "Entrar en `/admin/noticias` para ver el listado editorial.")
    add_number(doc, "Crear una nueva noticia desde `/admin/noticias/nueva`.")
    add_number(doc, "Completar título, slug, categoría, autor, imagen y contenido.")
    add_number(doc, "Guardar como borrador o publicar según la necesidad editorial.")
    add_number(doc, "Editar o actualizar noticias existentes cuando cambie la información.")

    add_heading(doc, "5.4 Gestión de categorías", 2)
    add_bullet(doc, "La sección `/admin/categorias` permite revisar las categorías disponibles.")
    add_bullet(doc, "Cada tarjeta incluye acciones reales para editar, activar o desactivar una categoría.")
    add_bullet(doc, "Cuando se crea una noticia, el campo de categoría se selecciona desde una lista para evitar errores de escritura.")

    add_heading(doc, "5.5 Gestión de usuarios", 2)
    add_bullet(doc, "La sección `/admin/usuarios` organiza a los integrantes del equipo editorial.")
    add_bullet(doc, "Las tarjetas de usuario también permiten editar, activar o desactivar cuentas.")
    add_bullet(doc, "Esto ayuda a controlar quién puede publicar, revisar o administrar contenido.")

    add_heading(doc, "5.6 Moderación de comentarios", 2)
    add_number(doc, "Abrir `/admin/comentarios` para revisar los mensajes recibidos.")
    add_number(doc, "Filtrar los comentarios por estado si desea trabajar solo con pendientes.")
    add_number(doc, "Aprobar los comentarios correctos para que aparezcan en la noticia.")
    add_number(doc, "Rechazar o eliminar mensajes ofensivos, spam o fuera de tema.")
    add_paragraph(
        doc,
        "Solo los comentarios aprobados se muestran al público en la página de la noticia.",
    )

    add_heading(doc, "6. Roles y permisos", 1)
    create_table(
        doc,
        ["Rol", "Qué puede hacer"],
        [
            ["Lector", "Leer noticias, filtrar contenido, abrir artículos y enviar comentarios o mensajes de contacto."],
            ["Editor", "Crear y editar noticias, seleccionar categorías, actualizar portadas y revisar comentarios."],
            ["Administrador", "Gestionar noticias, categorías, usuarios, moderación y acceso general al sistema."],
        ],
        [1.4, 5.1],
        header_fill="2E74B5",
    )

    add_heading(doc, "7. Buenas prácticas para el equipo editorial", 1)
    add_bullet(doc, "Mantener títulos claros y cortos para facilitar la lectura móvil.")
    add_bullet(doc, "Usar imágenes con buena calidad y relación directa con la noticia.")
    add_bullet(doc, "Revisar ortografía, fecha, autor y categoría antes de publicar.")
    add_bullet(doc, "Moderación constante: aprobar solo comentarios útiles y respetuosos.")
    add_bullet(doc, "Actualizar el contenido local con frecuencia para que la cinta de último minuto tenga información vigente.")

    add_heading(doc, "8. Solución de problemas", 1)
    create_table(
        doc,
        ["Problema", "Qué hacer"],
        [
            ["El sitio no abre", "Verifique que el servidor esté en ejecución y pruebe `http://localhost:3002/`."],
            ["No puedo iniciar sesión", "Revise el correo, la contraseña y confirme que la cuenta tenga rol de administrador."],
            ["No aparece una imagen", "Compruebe la URL o el archivo cargado en la noticia."],
            ["Un cambio no se ve reflejado", "Actualice el navegador; si está en desarrollo, reinicie el servidor si hace falta."],
            ["La navegación parece lenta al principio", "Es normal en modo desarrollo mientras Next.js compila la primera vez."],
        ],
        [1.9, 4.6],
    )

    add_heading(doc, "9. Resumen final", 1)
    add_paragraph(
        doc,
        "Bilwi Noticias ya cuenta con una base sólida para publicar contenido local, organizar secciones "
        "editoriales y administrar comentarios desde un panel central. Este manual resume el uso del sitio "
        "público y de las herramientas editoriales para que cualquier usuario pueda orientarse con rapidez.",
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUTPUT)
    return OUTPUT


if __name__ == "__main__":
    path = build_manual()
    print(path)
