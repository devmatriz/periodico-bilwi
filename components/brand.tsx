import { capHeight, horizontal, isoB, isoBar, noticias, bilwi, tile, tilePath, wordWidth } from "@/lib/brand-paths";

// Colores por contexto (ver .logo en globals.css):
//   --logo-ink    ficha y "BILWI"
//   --logo-accent "NOTICIAS"
//   --logo-cut    la B y la línea del horizonte, del color del fondo donde va el logo

function Mark() {
  return (
    <>
      <path className="logo-tile" d={tilePath} />
      <path className="logo-cut" d={isoB} />
      <path className="logo-cut" d={isoBar} />
    </>
  );
}

function Word() {
  return (
    <>
      <path className="logo-ink" d={bilwi} />
      <path className="logo-accent" d={noticias} />
    </>
  );
}

type LogoProps = {
  /** horizontal: ficha + nombre. nombre: solo el logotipo. ficha: solo el isotipo. */
  variant?: "horizontal" | "nombre" | "ficha";
  className?: string;
  /** Texto accesible; vacío si el logo es decorativo dentro de un enlace con etiqueta. */
  title?: string;
};

export function Logo({ variant = "horizontal", className, title = "Bilwi Noticias" }: LogoProps) {
  const a11y = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
  const classes = `logo logo--${variant}${className ? ` ${className}` : ""}`;

  if (variant === "ficha") {
    return (
      <svg className={classes} viewBox={`0 0 ${tile} ${tile}`} {...a11y} focusable="false">
        <Mark />
      </svg>
    );
  }

  if (variant === "nombre") {
    return (
      <svg className={classes} viewBox={`0 0 ${wordWidth} ${capHeight}`} {...a11y} focusable="false">
        <g transform={`translate(0 ${capHeight})`}>
          <Word />
        </g>
      </svg>
    );
  }

  const scale = horizontal.tileH / tile;
  const wordY = (horizontal.tileH + capHeight) / 2;

  return (
    <svg className={classes} viewBox={`0 0 ${horizontal.width} ${horizontal.tileH}`} {...a11y} focusable="false">
      <g transform={`scale(${scale})`}>
        <Mark />
      </g>
      <g transform={`translate(${horizontal.tileH + horizontal.gap} ${wordY})`}>
        <Word />
      </g>
    </svg>
  );
}
