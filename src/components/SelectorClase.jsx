"use client";

import { useEffect, useState } from "react";
import { SESIONES_DEFAULT } from "@/lib/config";

export default function SelectorClase({ ediciones, onAgregar, docenteEmail }) {
  const [cursoId, setCursoId] = useState("");
  const [claseOSesion, setClaseOSesion] = useState("1");
  const [alumno, setAlumno] = useState("");
  const [asignaciones, setAsignaciones] = useState([]);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [asignacionElegida, setAsignacionElegida] = useState(null);

  const edicionSeleccionada = ediciones.find((e) => e.cursoId === cursoId);
  const esSesion = edicionSeleccionada?.modalidad === "sesion";
  const tope = edicionSeleccionada?.topeSesiones || SESIONES_DEFAULT;

  useEffect(() => {
    setClaseOSesion("1");
    setAlumno("");
    setAsignacionElegida(null);
    setModoManual(false);
  }, [cursoId]);

  useEffect(() => {
    if (!esSesion || !docenteEmail) {
      setAsignaciones([]);
      return;
    }
    setCargandoAsignaciones(true);
    fetch(`/api/sesiones-asignadas?email=${encodeURIComponent(docenteEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setAsignaciones(data.asignaciones || []);
      })
      .catch(() => {})
      .finally(() => setCargandoAsignaciones(false));
  }, [esSesion, docenteEmail]);

  function handleAgregar() {
    if (!cursoId) return;
    if (esSesion && !alumno.trim()) return;
    onAgregar({
      cursoId,
      edicion: edicionSeleccionada?.edicion || "",
      claseOSesion,
      alumno: esSesion ? alumno.trim() : "",
    });
    if (asignacionElegida) {
      setAsignaciones((prev) =>
        prev
          .map((a) =>
            a === asignacionElegida
              ? { ...a, sesiones: a.sesiones.filter((s) => s !== claseOSesion) }
              : a
          )
          .filter((a) => a.sesiones.length > 0)
      );
      setAsignacionElegida(null);
      setAlumno("");
    }
  }

  const puedeAgregar = cursoId && (!esSesion || alumno.trim());
  const mostrarPreAsignadas = esSesion && !modoManual;

  return (
    <div className="border border-[var(--clay-300)] rounded-xl p-4 mb-4">
      <label className="block text-xs font-medium text-[var(--ink)]/60 mb-1.5">
        Curso / edición
      </label>
      <select
        data-tour="selector-curso"
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
          {mostrarPreAsignadas && (
            <div className="mb-3" data-tour="selector-clase">
              <label className="block text-xs font-medium text-[var(--ink)]/60 mb-1.5">
                Tus sesiones asignadas
              </label>
              {cargandoAsignaciones && (
                <p className="text-xs text-[var(--ink)]/50">Buscando tus sesiones asignadas...</p>
              )}
              {!cargandoAsignaciones && asignaciones.length === 0 && (
                <p className="text-xs text-[var(--ink)]/50 mb-2">
                  No encontramos sesiones pre-asignadas para vos. Podés cargarla manualmente.
                </p>
              )}
              {!cargandoAsignaciones && asignaciones.length > 0 && (
                <div className="space-y-1.5">
                  {asignaciones.map((a, i) => (
                    <div
                      key={i}
                      className="border border-[var(--clay-300)] rounded-lg px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--ink)]">{a.alumno}</p>
                        <p className="text-xs text-[var(--ink)]/55">
                          {a.edicion ? `Edición ${a.edicion} · ` : ""}
                          {a.sesiones.length} sesión(es) pendiente(s)
                        </p>
                      </div>
                      <select
                        className="border border-[var(--clay-300)] rounded-lg px-2 py-1 text-sm outline-none"
                        value=""
                        onChange={(e) => {
                          const sesion = e.target.value;
                          if (!sesion) return;
                          setAlumno(a.alumno);
                          setClaseOSesion(sesion);
                          setAsignacionElegida(a);
                        }}
                      >
                        <option value="">Elegir sesión...</option>
                        {a.sesiones.map((s) => (
                          <option key={s} value={s}>
                            Sesión {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setModoManual(true)}
                className="text-xs text-[var(--amber-600)] underline mt-2"
              >
                No encuentro mi sesión, cargarla a mano
              </button>
              {asignacionElegida && (
                <p className="text-xs text-[var(--ink)]/60 mt-2">
                  Vas a agregar la sesión {claseOSesion} de {alumno}.
                </p>
              )}
            </div>
          )}

          {(!esSesion || modoManual) && (
            <>
              <label className="block text-xs font-medium text-[var(--ink)]/60 mb-1.5">
                {esSesion ? "Número de sesión" : "Número de clase"}
              </label>
              <div className="flex items-center gap-3 mb-3" data-tour={!esSesion ? "selector-clase" : undefined}>
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
            </>
          )}

          <button
            data-tour="boton-agregar"
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
