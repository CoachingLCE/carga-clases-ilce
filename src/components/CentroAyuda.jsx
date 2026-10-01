"use client";

import { MAIL_ADMINISTRACION } from "@/lib/config";

export default function CentroAyuda({ onCerrar, onTutorial, onRecorrido }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-[var(--ink)]/40 text-lg leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>
        <h2 className="font-display text-lg text-[var(--teal-900)] mb-4">¿Necesitás ayuda?</h2>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onCerrar();
              onTutorial();
            }}
            className="w-full text-left border border-[var(--line)] rounded-xl px-4 py-3 text-sm text-[var(--teal-900)] hover:border-[var(--teal-500)] transition-colors"
          >
            Ver tutorial
          </button>
          <button
            type="button"
            onClick={() => {
              onCerrar();
              onRecorrido();
            }}
            className="w-full text-left border border-[var(--line)] rounded-xl px-4 py-3 text-sm text-[var(--teal-900)] hover:border-[var(--teal-500)] transition-colors"
          >
            Ver recorrido guiado
          </button>
          <a
            href={`mailto:${MAIL_ADMINISTRACION}`}
            className="block border border-[var(--line)] rounded-xl px-4 py-3 text-sm text-[var(--teal-900)] hover:border-[var(--teal-500)] transition-colors"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  );
}
