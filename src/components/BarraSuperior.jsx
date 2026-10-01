"use client";

import { LINKS_RAPIDOS } from "@/lib/config";

const REDES = [
  { clave: "instagram", icono: "📷", label: "Instagram" },
  { clave: "facebook", icono: "📘", label: "Facebook" },
  { clave: "whatsapp", icono: "💬", label: "WhatsApp" },
  { clave: "linkedin", icono: "💼", label: "LinkedIn" },
];

function ItemNav({ onClick, href, children }) {
  const clases =
    "text-xs sm:text-[13px] text-[var(--ink)]/65 hover:text-[var(--teal-700)] whitespace-nowrap transition-colors";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={clases}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={clases}>
      {children}
    </button>
  );
}

// Reemplaza los botones sueltos de "Ver tutorial" / "Ver recorrido" / etc. por una
// barra ordenada tipo Dashboard — a la izquierda la navegación, a la derecha las redes.
export default function BarraSuperior({
  onMiActividad,
  onHistorial,
  onTutorial,
  onRecorrido,
  onAyuda,
}) {
  const redesConLink = REDES.filter((r) => LINKS_RAPIDOS[r.clave]);

  return (
    <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 mb-3 border-b border-[var(--line)]">
      <div className="flex items-center gap-3.5 sm:gap-4">
        <ItemNav onClick={onMiActividad}>Mi actividad</ItemNav>
        <ItemNav onClick={onHistorial}>Historial</ItemNav>
        <ItemNav onClick={onTutorial}>Tutorial</ItemNav>
        <ItemNav onClick={onRecorrido}>Recorrido guiado</ItemNav>
        {LINKS_RAPIDOS.campus && <ItemNav href={LINKS_RAPIDOS.campus}>Campus</ItemNav>}
        <ItemNav onClick={onAyuda}>Ayuda</ItemNav>
      </div>

      {redesConLink.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          {redesConLink.map((r) => (
            <a
              key={r.clave}
              href={LINKS_RAPIDOS[r.clave]}
              target="_blank"
              rel="noreferrer"
              title={r.label}
              className="w-7 h-7 rounded-full border border-[var(--line)] flex items-center justify-center text-sm hover:border-[var(--teal-500)] transition-colors"
            >
              {r.icono}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
