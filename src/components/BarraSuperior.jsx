"use client";

import { LINKS_RAPIDOS } from "@/lib/config";

const REDES = [
  { clave: "instagram", icono: "📷", label: "Instagram" },
  { clave: "facebook", icono: "📘", label: "Facebook" },
  { clave: "whatsapp", icono: "💬", label: "WhatsApp" },
  { clave: "linkedin", icono: "💼", label: "LinkedIn" },
];

// Chip con el mismo lenguaje visual que el Nav de ILCE Gestión (seguimiento-lead-estudiante):
// pastilla redondeada, texto gris cuando está inactivo, fondo + texto teal al pasar el mouse.
function Chip({ onClick, href, children, destacado }) {
  const base =
    "h-8 flex items-center px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors";
  const clases = destacado
    ? `${base} text-white`
    : `${base} text-[var(--ink)]/60 hover:text-[var(--teal-900)] hover:bg-[var(--clay-100)]`;
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

// Reemplaza los botones de texto sueltos ("Ver tutorial", "Ver recorrido", etc.) por una
// barra de navegación con el mismo lenguaje visual que el resto de las apps de ILCE.
export default function BarraSuperior({
  onMiActividad,
  onHistorial,
  onTutorial,
  onRecorrido,
  onAyuda,
}) {
  const redesConLink = REDES.filter((r) => LINKS_RAPIDOS[r.clave]);

  return (
    <div className="border-b border-[var(--line)] pb-3 mb-4">
      <nav className="flex items-center gap-1.5 flex-wrap">
        {LINKS_RAPIDOS.campus && (
          <Chip href={LINKS_RAPIDOS.campus} destacado>
            🎓 Ir al Campus
          </Chip>
        )}
        <Chip onClick={onMiActividad}>Mi actividad</Chip>
        <Chip onClick={onHistorial}>Historial</Chip>
        <Chip onClick={onTutorial}>Tutorial</Chip>
        <Chip onClick={onRecorrido}>Recorrido guiado</Chip>
        <Chip onClick={onAyuda}>Ayuda</Chip>

        {redesConLink.length > 0 && (
          <div className="flex items-center gap-1.5 ml-auto pl-2 border-l border-[var(--line)]">
            {redesConLink.map((r) => (
              <a
                key={r.clave}
                href={LINKS_RAPIDOS[r.clave]}
                target="_blank"
                rel="noreferrer"
                title={r.label}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-sm text-[var(--ink)]/60 hover:border-[var(--teal-500)] hover:text-[var(--teal-700)] transition-colors"
              >
                {r.icono}
              </a>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}
