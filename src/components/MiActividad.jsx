"use client";

import { useEffect, useState } from "react";
import { haceCuanto } from "@/lib/tiempo";

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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5" aria-label="Mi actividad del mes">
      <Indicador etiqueta="Clases cargadas" valor={cargando ? "…" : totalClases} />
      <Indicador etiqueta="Cursos distintos" valor={cargando ? "…" : cursosDistintos} />
      <Indicador
        etiqueta="Facturación estimada"
        valor={`$${total.toLocaleString("es-AR")}`}
        destacado
      />
      <Indicador etiqueta="Última carga" valor={cargando ? "…" : haceCuanto(ultima?.timestamp)} />
    </div>
  );
}

// Un solo resumen del mes (antes había dos que repetían los mismos datos).
function Indicador({ etiqueta, valor, destacado }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--panel)] rounded-xl px-4 py-3">
      <p className="text-[13px] font-semibold text-ink2 leading-tight">{etiqueta}</p>
      <p
        className={`mt-1 font-mono text-xl font-semibold leading-tight ${
          destacado ? "text-[var(--teal-700)]" : "text-[var(--teal-900)]"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
