"use client";

export default function Tutorial({ onCerrar }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
        <button
          onClick={onCerrar}
          aria-label="Cerrar tutorial"
          className="absolute top-3 right-3 text-[var(--ink)]/40 hover:text-[var(--ink)] text-lg leading-none"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">¿Cómo funciona?</h2>
        <ol className="text-sm text-[var(--ink)]/75 space-y-2 list-decimal list-inside">
          <li>Elegí el curso o edición donde diste clase.</li>
          <li>Indicá si fue una clase de cohorte o una sesión individual.</li>
          <li>Repetí el paso para agregar todas las clases del mes.</li>
          <li>Confirmá la carga y subí tu factura al final.</li>
        </ol>
        <p className="text-xs text-[var(--ink)]/50 mt-4">
          Podés cargar tus clases hasta el día 10 de cada mes.
        </p>
        <button
          onClick={onCerrar}
          className="mt-5 w-full bg-[var(--amber-600)] text-white rounded-lg px-4 py-2.5 text-sm font-semibold"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
