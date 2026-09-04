"use client";

import { useEffect, useState } from "react";

// Widget chico y persistente (no una sección enorme): cuántas clases/sesiones
// lleva cargadas este mes el docente, y el total acumulado. Se apoya en el
// mismo endpoint que "Ver mis cargas", pero solo muestra el resumen.
export default function MiActividad({ docenteEmail, mes, modoPrueba, refreshSignal }) {
  const [cargas, setCargas] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!docenteEmail || modoPrueba) {
      setCargas([]);
      return;
    }
    setCargando(true);
    fetch(`/api/mis-cargas?email=${encodeURIComponent(docenteEmail)}&mes=${encodeURIComponent(mes || "")}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setCargas(data.cargas);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [docenteEmail, mes, modoPrueba, refreshSignal]);

  if (modoPrueba) return null;

  const totalClases = cargas.length;
  const total = cargas.reduce((acc, c) => acc + (c.valor || 0), 0);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-[var(--line)] bg-[var(--panel)] rounded-xl px-4 py-2.5 mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[var(--teal-500)] font-semibold shrink-0">
        Mi actividad
      </p>
      <span className="text-sm text-[var(--ink)]/70">
        <strong className="text-[var(--teal-900)] font-mono">{cargando ? "…" : totalClases}</strong>{" "}
        cargada{totalClases === 1 ? "" : "s"} este mes
      </span>
      <span className="text-sm text-[var(--ink)]/70">
        Total:{" "}
        <strong className="text-[var(--teal-700)] font-mono">
          ${total.toLocaleString("es-AR")}
        </strong>
      </span>
    </div>
  );
}
