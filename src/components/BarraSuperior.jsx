"use client";

import { LINKS_RAPIDOS } from "@/lib/config";
import { IconoInstagram, IconoFacebook, IconoWhatsapp, IconoLinkedin } from "./IconosRedes";
import ThemeSelector from "./ThemeSelector";

const REDES = [
  { clave: "instagram", Icono: IconoInstagram, label: "Instagram" },
  { clave: "facebook", Icono: IconoFacebook, label: "Facebook" },
  { clave: "whatsapp", Icono: IconoWhatsapp, label: "WhatsApp" },
  { clave: "linkedin", Icono: IconoLinkedin, label: "LinkedIn" },
];

// Chip con el mismo lenguaje visual que el Nav de ILCE Gestión (seguimiento-lead-estudiante):
// pastilla redondeada, texto gris cuando está inactivo, fondo + texto teal al pasar el mouse.
function Chip({ onClick, href, children, destacado }) {
  const base =
    "h-8 flex items-center px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors";
  const clases = destacado
    ? `${base} text-white shrink-0`
    : `${base} text-[var(--ink)]/60 hover:text-[var(--teal-900)] hover:bg-[var(--clay-100)] shrink-0`;
  const estiloDestacado = destacado
    ? { background: "linear-gradient(90deg, var(--teal-700), var(--amber-600))" }
    : undefined;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={clases} style={estiloDestacado}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={clases} style={estiloDestacado}>
      {children}
    </button>
  );
}

// Barra fija arriba de todo, de ancho completo — igual que el Nav de las demás apps de ILCE
// (seguimiento-lead-estudiante): logo a la izquierda, chips de navegación, redes a la derecha.
// El contenido interno respeta el mismo ancho máximo que el resto de la pantalla.
export default function BarraSuperior({
  onMiActividad,
  onHistorial,
  onTutorial,
  onAyuda,
}) {
  const redesConLink = REDES.filter((r) => LINKS_RAPIDOS[r.clave]);

  return (
    <div
      className="sticky top-0 z-40 border-b border-[var(--line)]"
      style={{ background: "var(--panel)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 flex-wrap py-2.5">
          <img
            src="/logo-ilce-color.png"
            alt="Instituto ILCE"
            className="h-6 w-auto shrink-0 mr-1 block dark:hidden"
          />
          <img
            src="/logo-ilce-blanco.png"
            alt="Instituto ILCE"
            className="h-6 w-auto shrink-0 mr-1 hidden dark:block"
          />
          <nav className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {LINKS_RAPIDOS.campus && (
              <Chip href={LINKS_RAPIDOS.campus} destacado>
                🎓 Campus
              </Chip>
            )}
            <Chip onClick={onMiActividad}>Mi actividad</Chip>
            <Chip onClick={onHistorial}>Historial</Chip>
            <Chip onClick={onTutorial}>Tutorial</Chip>
            <Chip onClick={onAyuda}>Ayuda</Chip>
          </nav>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--line)] shrink-0">
            <ThemeSelector />
            {redesConLink.map((r) => (
              <a
                key={r.clave}
                href={LINKS_RAPIDOS[r.clave]}
                target="_blank"
                rel="noreferrer"
                title={r.label}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
              >
                <r.Icono size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
