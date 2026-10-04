"use client";

import { useEscape } from "@/lib/useEscape";

// Reemplaza al window.confirm() del navegador: mismo uso (aceptar / cancelar), pero con el diseño
// de la app, cierre con Esc o clic afuera y, en celular, como panel que sube desde abajo.
export default function DialogoConfirmar({
  titulo,
  children,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  peligro = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  useEscape(true, onCancelar);
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dlg-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div className="bg-[var(--panel)] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-[var(--line)]">
        <h2 id="dlg-titulo" className="font-display text-lg text-[var(--teal-900)] mb-2">
          {titulo}
        </h2>
        <div className="text-sm text-ink2 mb-5 leading-relaxed">{children}</div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={onCancelar}
            className="h-11 sm:h-10 px-4 rounded-full border border-[var(--line)] text-sm font-medium text-[var(--ink)] hover:bg-[var(--clay-100)]"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className={`h-11 sm:h-10 px-4 rounded-full text-sm font-semibold text-[var(--panel)] disabled:opacity-60 ${
              peligro ? "bg-clay600 hover:opacity-90" : "bg-primary hover:bg-primaryHover"
            }`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
