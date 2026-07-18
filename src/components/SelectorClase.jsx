"use client";

import { useEffect, useState } from "react";
import { SESIONES_DEFAULT } from "@/lib/config";

export default function SelectorClase({ ediciones, onAgregar }) {
  const [cursoId, setCursoId] = useState("");
  const [claseOSesion, setClaseOSesion] = useState("1");
  const [alumno, setAlumno] = useState("");

  const edicionSeleccionada = ediciones.find((e) => e.cursoId === cursoId);
  const esSesion = edicionSeleccionada?.modalidad === "sesion";
  const tope = edicionSeleccionada?.topeSesiones || SESIONES_DEFAULT;

  useEffect(() => {
    setClaseOSesion("1");
    setAlumno("");
  }, [cursoId]);

  function handleAgregar() {
    if (!cursoId) return;
    if (esSesion && !alumno.trim()) return;
    onAgregar({
      cursoId,
      edicion: edicionSeleccionada?.edicion || "",
      claseOSesion,
      alumno: esSesion ? alumno.trim() : "",
    });
  }

  const puedeAgregar = cursoId && (!esSesion || alumno.trim());

  return (
    <div className="border border-[var(--clay-300)] rounded-xl p-4 mb-4">
      <label className="block text-xs font-medium text-[var(--ink)]/60 mb-1.5">
        Curso / edición
      </label>
      <select
        value={cursoId}
        onChange={(e) => setCursoId(e.target.value)}
        className="w-full border border-[var(--clay-300)] rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[var(--amber-600)]"
      >
        <option value="">Seleccioná un curso...</option>
        {ediciones.map((e) => (
          <option key={e.cursoId} value={e.cursoId}>
            {e.nombreCurso} {e.edicion ? `— ${e.edicion}` : ""}
          </option>
        ))}
      </select>

      {cursoId && (
        <>
          <label className="block text-xs font-medium text-[var(--ink)]/60 mb-1.5">
            {esSesion ? "Número de sesión" : "Número de clase"}
          </label>
          <div className="flex items-center gap-3 mb-3">
            <select
              value={claseOSesion}
              onChange={(e) => setClaseOSesion(e.target.value)}
              className="border border-[var(--clay-300)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--amber-600)]"
            >
              {Array.from({ length: tope }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="flex-1 h-1.5 bg-[var(--clay-100)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--amber-600)]"
                style={{ width: `${(Number(claseOSesion) / tope) * 100}%` }}
              />
            </div>
          </div>

          {esSesion && (
            <>
              <label className="block text-xs font-medium text-[var(--ink)]/60 mb-1.5">
                Nombre del alumno
              </label>
              <input
                type="text"
                value={alumno}
                onChange={(e) => setAlumno(e.target.value)}
                placeholder="Nombre y apellido"
                className="w-full border border-[var(--clay-300)] rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[var(--amber-600)]"
              />
            </>
          )}

          <button
            onClick={handleAgregar}
            disabled={!puedeAgregar}
            className="w-full bg-[var(--ink)] text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Agregar {esSesion ? "sesión" : "clase"} a mi carga
          </button>
        </>
      )}
    </div>
  );
}
