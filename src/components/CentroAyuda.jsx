"use client";

import { MAIL_ADMINISTRACION } from "@/lib/config";
import { useEscape } from "@/lib/useEscape";
import { APP_VERSION } from "@/lib/version";

export default function CentroAyuda({ onCerrar, onTutorial, onRecorrido }) {
  useEscape(true, onCerrar);
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        className="rounded-2xl w-full max-w-sm p-6 relative"
        style={{ background: "var(--panel)" }}
      >
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-muted text-lg leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="font-display text-lg text-[var(--teal-900)] mb-1">
          Te mostramos cómo funciona Carga de Clases
        </h2>
        <p className="text-xs text-muted mb-4">
          Vamos a recorrer juntos lo principal, y te ayudamos con lo que necesites.
        </p>

        <button
          type="button"
          onClick={() => {
            onCerrar();
            onRecorrido();
          }}
          className="w-full bg-primary hover:bg-primaryHover text-white rounded-lg px-3 py-2.5 text-sm font-semibold mb-4"
        >
          Comenzar recorrido
        </button>

        <p className="text-[12.5px] text-muted mb-1.5 font-semibold">
          O elegí una ayuda puntual:
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              onCerrar();
              onTutorial();
            }}
            className="text-left text-sm text-[var(--teal-900)] border border-[var(--line)] rounded-lg px-3 py-2 hover:border-[var(--teal-500)] transition-colors"
          >
            Ver tutorial
          </button>
          <button
            type="button"
            onClick={() => {
              onCerrar();
              window.dispatchEvent(new Event("ilce:novedades"));
            }}
            className="text-left text-sm text-[var(--teal-900)] border border-[var(--line)] rounded-lg px-3 py-2 hover:border-[var(--teal-500)] transition-colors flex items-center justify-between"
          >
            <span>Novedades de la app</span>
            <span className="text-[12.5px] text-muted">v{APP_VERSION}</span>
          </button>
          <a
            href={`mailto:${MAIL_ADMINISTRACION}`}
            className="text-sm text-[var(--teal-900)] border border-[var(--line)] rounded-lg px-3 py-2 hover:border-[var(--teal-500)] transition-colors"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  );
}
