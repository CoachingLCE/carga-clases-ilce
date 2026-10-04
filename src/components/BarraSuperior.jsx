"use client";

import { useState } from "react";
import { LINKS_RAPIDOS } from "@/lib/config";
import { useEscape } from "@/lib/useEscape";
import { IconoInstagram, IconoFacebook, IconoWhatsapp, IconoLinkedin } from "./IconosRedes";
import ThemeSelector from "./ThemeSelector";

const REDES = [
  { clave: "instagram", Icono: IconoInstagram, label: "Instagram" },
  { clave: "facebook", Icono: IconoFacebook, label: "Facebook" },
  { clave: "whatsapp", Icono: IconoWhatsapp, label: "WhatsApp" },
  { clave: "linkedin", Icono: IconoLinkedin, label: "LinkedIn" },
];

// Chip de navegación. "bloque" es la versión del menú desplegable en celular: ocupa todo el ancho
// y tiene 44 px de alto para que se pueda tocar cómodo.
function Chip({ onClick, href, children, destacado, bloque }) {
  const base = `${bloque ? "h-11 w-full text-[15px]" : "h-8 text-[13.5px] shrink-0"} flex items-center px-3.5 rounded-full font-medium whitespace-nowrap transition-colors`;
  const clases = destacado
    ? `${base} bg-primarySoft text-primarySoftFg`
    : `${base} text-ink2 hover:text-[var(--teal-900)] hover:bg-[var(--clay-100)]`;

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

// Barra fija arriba de todo. En pantallas medianas y grandes: logo, chips de navegación y redes
// en una sola fila. En celular: logo, selector de tema y botón de menú; los chips y las redes van
// en un panel desplegable (antes se apilaban y la barra ocupaba casi un cuarto de la pantalla).
export default function BarraSuperior({ onMiActividad, onHistorial, onTutorial, onAyuda }) {
  const [abierto, setAbierto] = useState(false);
  useEscape(abierto, () => setAbierto(false));
  const redesConLink = REDES.filter((r) => LINKS_RAPIDOS[r.clave]);

  // En el menú de celular, al elegir una opción el panel se cierra.
  const accion = (fn) => () => {
    setAbierto(false);
    if (fn) fn();
  };

  const chips = (bloque) => (
    <>
      {LINKS_RAPIDOS.campus && (
        <Chip href={LINKS_RAPIDOS.campus} destacado bloque={bloque}>
          🎓 Campus
        </Chip>
      )}
      <Chip onClick={accion(onMiActividad)} bloque={bloque}>Mi actividad</Chip>
      <Chip onClick={accion(onHistorial)} bloque={bloque}>Historial</Chip>
      <Chip onClick={accion(onTutorial)} bloque={bloque}>Tutorial</Chip>
      <Chip onClick={accion(onAyuda)} bloque={bloque}>Ayuda</Chip>
    </>
  );

  const redes = redesConLink.map((r) => (
    <a
      key={r.clave}
      href={LINKS_RAPIDOS[r.clave]}
      target="_blank"
      rel="noreferrer"
      title={r.label}
      aria-label={r.label}
      className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
    >
      <r.Icono size={22} />
    </a>
  ));

  return (
    <div className="sticky top-0 z-40 border-b border-[var(--line)]" style={{ background: "var(--panel)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-2.5">
          <img src="/logo-ilce-color.png" alt="Instituto ILCE" className="h-6 w-auto shrink-0 mr-1 block dark:hidden" />
          <img src="/logo-ilce-blanco.png" alt="Instituto ILCE" className="h-6 w-auto shrink-0 mr-1 hidden dark:block" />

          <nav className="hidden md:flex items-center gap-1.5 flex-1 min-w-0" aria-label="Principal">
            {chips(false)}
          </nav>
          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-1.5 md:pl-2 md:border-l md:border-[var(--line)] shrink-0">
            <ThemeSelector />
            <div className="hidden md:flex items-center gap-1.5">{redes}</div>
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={abierto}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--clay-100)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {abierto ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {abierto && (
          <nav className="md:hidden pb-3 grid gap-1" aria-label="Menú">
            {chips(true)}
            <div className="flex items-center gap-1.5 pt-2 mt-1 border-t border-[var(--line)]">{redes}</div>
          </nav>
        )}
      </div>
    </div>
  );
}
