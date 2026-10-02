"use client";

import { MAIL_ADMINISTRACION } from "@/lib/config";

export default function CentroAyuda({ onCerrar, onTutorial, onRecorrido }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div
        className="rounded-2xl w-full max-w-sm p-6 relative"
        style={{ background: "var(--panel)" }}
      >
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-[var(--ink)]/40 text-lg leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <h2 className="font-display text-lg text-[var(--teal-900)] mb-1">
          Te mostramos cómo funciona Carga de Clases
        </h2>
        <p className="text-xs text-[var(--ink)]/60 mb-4">
          Vamos a recorrer juntos lo principal, y te ayudamos con lo que necesites.
        </p>

        <button
          type="button"
          onClick={() => {
            onCerrar();
            onRecorrido();
          }}
          className="w-full text-white rounded-lg px-3 py-2.5 text-sm font-semibold mb-4"
          style={{ background: "linear-gradient(90deg, var(--teal-700), var(--amber-600))" }}
        >
          Comenzar recorrido
        </button>

        <p className="text-[11px] text-[var(--ink)]/55 mb-1.5 font-semibold">
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
