"use client";

const PASOS = [
  {
    t: "1. Elegí curso, edición y clase",
    d: "Seleccioná el curso que dictaste, la edición y la clase o sesión puntual.",
  },
  {
    t: "2. Las clases ya cargadas no aparecen",
    d: "Si otro docente ya cargó esa clase o sesión, no la vas a ver disponible — así evitamos que se facture dos veces lo mismo.",
  },
  {
    t: "3. Confirmá tu carga",
    d: "Al confirmar vas a ver el total a facturar de este período.",
  },
  {
    t: "4. Subí tu factura",
    d: 'Desde "Subir factura" adjuntás el PDF o foto de tu factura, y te armamos una guía con los datos exactos para cargarla bien (CUIT, cantidad, valor).',
  },
  {
    t: "Un detalle importante",
    d: "La carga de cada mes arranca el último día de ese mes y se puede hacer hasta el día 10 del mes siguiente. Después se cierra automáticamente.",
  },
];

export default function Tutorial({ onCerrar }) {
  return (
    <div className="fixed inset-0 bg-[var(--ink)]/50 flex items-end sm:items-center justify-center z-50 p-3 fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-[20px] border border-[var(--line)] max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-[var(--paper)] text-[var(--ink)]/60 text-base leading-none hover:text-[var(--ink)]"
        >
          ×
        </button>

        <div className="px-6 pt-6 pb-4 border-b border-[var(--line)]">
          <p className="text-[11px] uppercase tracking-wide text-[var(--teal-500)]">Antes de arrancar</p>
          <h2 className="font-display text-[22px] text-[var(--teal-900)] mt-1">
            Cómo funciona la carga de clases
          </h2>
        </div>
        <div className="px-6 py-4">
          {PASOS.map((p, i) => (
            <div
              key={i}
              className="tutorial-step mb-4"
              style={{ animationDelay: `${i * 0.45}s` }}
            >
              <h3 className="font-display text-[16px] text-[var(--ink)] mb-0.5">{p.t}</h3>
              <p className="text-sm text-[var(--ink)]/75 leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
        <div
          className="tutorial-step px-6 pb-6"
          style={{ animationDelay: `${PASOS.length * 0.45}s` }}
        >
          <button
            onClick={onCerrar}
            className="w-full bg-[var(--amber-600)] text-white rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            Entendido, empezar
          </button>
        </div>
      </div>
    </div>
  );
}
