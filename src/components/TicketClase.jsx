"use client";

export default function TicketClase({ item, nombreCurso, valor, onQuitar }) {
  return (
    <div className="flex items-center justify-between border border-[var(--clay-300)] rounded-lg px-4 py-2.5 mb-2">
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">
          {nombreCurso} {item.edicion ? `— ${item.edicion}` : ""}
        </p>
        <p className="text-xs text-[var(--ink)]/55">
          {item.alumno ? `Sesión ${item.claseOSesion} · ${item.alumno}` : `Clase ${item.claseOSesion}`}
          {valor != null && ` · $${valor.toLocaleString("es-AR")}`}
        </p>
      </div>
      <button
        onClick={onQuitar}
        aria-label="Quitar"
        className="text-[var(--ink)]/40 hover:text-[var(--clay-600)] text-sm"
      >
        Quitar
      </button>
    </div>
  );
}
