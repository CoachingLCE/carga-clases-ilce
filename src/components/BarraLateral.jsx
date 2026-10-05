"use client";

import { useEffect } from "react";
import { LINKS_RAPIDOS } from "@/lib/config";
import { IconoInstagram, IconoFacebook, IconoWhatsapp, IconoLinkedin } from "./IconosRedes";
import ThemeSelector from "./ThemeSelector";

// ---- Barra lateral (escritorio) -------------------------------------------------------------
// Decisión de Diego (04/10/2026): que las apps de ILCE parezcan de la misma empresa. En pantallas grandes
// (>= lg) los destinos van en una barra lateral fija, igual a la de Fichas, Gestión, Cronograma y Presentismo
// (logo con el nombre de la app, destinos con ícono y la pantalla actual marcada). En tablet y celular se sigue
// usando la barra de arriba. Los íconos son de la fuente /fonts/iconos.woff2 (ver lib/iconos.js).
const REDES = [
  { clave: "instagram", Icono: IconoInstagram, label: "Instagram" },
  { clave: "facebook", Icono: IconoFacebook, label: "Facebook" },
  { clave: "whatsapp", Icono: IconoWhatsapp, label: "WhatsApp" },
  { clave: "linkedin", Icono: IconoLinkedin, label: "LinkedIn" },
];

function Item({ onClick, href, icono, destacado, activo, children }) {
  const clases = `relative flex items-center gap-2.5 h-8 w-full px-3 rounded-lg text-[14px] text-left transition-colors ${
    activo
      ? "bg-primarySoft text-primarySoftFg font-semibold"
      : destacado
        ? "bg-primarySoft text-primarySoftFg font-medium"
        : "text-ink2 hover:text-[var(--teal-900)] hover:bg-[var(--clay-100)] font-medium"
  }`;
  const contenido = (
    <>
      {activo && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
      <span aria-hidden="true" className="inline-block w-[18px] text-[18px] leading-none text-center shrink-0">{icono}</span>
      <span className="truncate">{children}</span>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={clases}>
        {contenido}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-current={activo ? "page" : undefined} className={clases}>
      {contenido}
    </button>
  );
}

export default function BarraLateral({ items }) {
  // Deja lugar a la barra en pantallas grandes (ver .con-menu-lateral en globals.css).
  useEffect(() => {
    document.body.classList.add("con-menu-lateral");
    return () => document.body.classList.remove("con-menu-lateral");
  }, []);
  const redesConLink = REDES.filter((r) => LINKS_RAPIDOS[r.clave]);

  return (
    <aside
      aria-label="Navegación principal"
      className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[248px] flex-col border-r border-[var(--line)] no-print"
      style={{ background: "var(--panel)" }}
    >
      <div className="px-5 pt-4 pb-3">
        <img src="/logo-ilce-color.png" alt="Instituto ILCE" className="h-8 w-auto block dark:hidden" />
        <img src="/logo-ilce-blanco.png" alt="Instituto ILCE" className="h-8 w-auto hidden dark:block" />
        <p className="mt-1.5 text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">Carga de clases</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        {items.map((it) => (
          <Item key={it.label} {...it}>{it.label}</Item>
        ))}
      </nav>
      <div className="border-t border-[var(--line)] px-4 py-3 space-y-2.5">
        <ThemeSelector />
        <div className="flex items-center gap-1">
          {redesConLink.map((r) => (
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
          ))}
        </div>
      </div>
    </aside>
  );
}
