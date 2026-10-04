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
  const cursosDistintos = new Set(cargas.map((c) => c.cursoReal)).size;
  const ultima = cargas[0]; // ya vienen ordenadas más reciente primero
  const ultimaHaceTexto = (() => {
    if (!ultima?.timestamp) return "—";
    const ms = Date.now() - new Date(ultima.timestamp).getTime();
    const dias = Math.floor(ms / 86400000);
    if (dias <= 0) return "Hoy";
    if (dias === 1) return "Hace 1 día";
    return `Hace ${dias} días`;
  })();

  return (
    <div className="border border-[var(--line)] bg-[var(--panel)] rounded-xl px-4 py-3 mb-4">
      <p className="text-[12.5px] uppercase tracking-wide text-[var(--teal-500)] font-semibold mb-2.5">
        Mi actividad
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="text-center">
          <p className="text-lg font-mono font-semibold text-[var(--teal-900)]">
            {cargando ? "…" : totalClases}
          </p>
          <p className="text-[12.5px] text-muted leading-tight">Clases cargadas</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-mono font-semibold text-[var(--teal-900)]">
            {cargando ? "…" : cursosDistintos}
          </p>
          <p className="text-[12.5px] text-muted leading-tight">Cursos distintos</p>
        </div>
        <div className="text-center">
          <p className="text-[15px] font-mono font-semibold text-[var(--teal-700)]">
            ${total.toLocaleString("es-AR")}
          </p>
          <p className="text-[12.5px] text-muted leading-tight">Facturación estimada</p>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-mono font-semibold text-[var(--teal-900)]">
            {cargando ? "…" : ultimaHaceTexto}
          </p>
          <p className="text-[12.5px] text-muted leading-tight">Última carga</p>
        </div>
      </div>
    </div>
  );
}
