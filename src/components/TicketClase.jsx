"use client";

export default function TicketClase({ item, nombreCurso, valor, onQuitar }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--panel)] rounded-lg px-5 py-3 flex items-center justify-between mb-2">
      <div>
        <p className="text-sm font-medium text-[var(--teal-900)]">
          {nombreCurso} {item.edicion ? `— ${item.edicion}` : ""}
        </p>
        <p className="text-xs text-[var(--ink)]/60 mt-0.5">
          {item.alumno ? `Alumno: ${item.alumno} · ` : ""}N°{" "}
          <span className="font-mono">{item.claseOSesion}</span>
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        {valor != null && (
          <span className="font-mono text-sm text-[var(--teal-700)]">
            ${valor.toLocaleString("es-AR")}
          </span>
        )}
        <button
          onClick={onQuitar}
          aria-label="Quitar"
          className="text-[var(--clay-600)] text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
