"use client";

import { useEffect, useState } from "react";
import { SESIONES_DEFAULT, DEMO_ASIGNACIONES } from "@/lib/config";

export default function SelectorClase({ ediciones, onAgregar, docenteEmail, modoPrueba, mes }) {
  const [cursoId, setCursoId] = useState("");
  const [alumno, setAlumno] = useState("");
  const [selChips, setSelChips] = useState([]);
  const [tomadas, setTomadas] = useState([]);
  const [cargandoTomadas, setCargandoTomadas] = useState(false);

  const [asignaciones, setAsignaciones] = useState([]);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [asignacionElegida, setAsignacionElegida] = useState(null);

  // Resumen de pendientes de TODAS las ediciones (solo Coaching Ontológico,
  // que es el único curso con planilla de asignaciones por ahora).
  const [resumenPendientes, setResumenPendientes] = useState([]);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState("");

  const edicionSeleccionada = ediciones.find((e) => e.cursoId === cursoId);
  const esSesion = edicionSeleccionada?.modalidad === "sesion";
  const tope = edicionSeleccionada?.topeSesiones || SESIONES_DEFAULT;

  // Reemplaza el viejo useEffect de reset por cursoId: al centralizar acá
  // el cambio de curso, podemos "precargar" alumno/sesión (desde el resumen
  // de pendientes) sin que un efecto los borre justo después.
  function seleccionarCurso(nuevoCursoId, presetAlumno = "", presetSesion = null, irDirectoAConfirmar = false) {
    setCursoId(nuevoCursoId);
    setSelChips(presetSesion ? [String(presetSesion)] : []);
    setAlumno(presetAlumno);
    setAsignacionElegida(null);
    // Si viene con datos precargados (desde el resumen de pendientes),
    // saltamos el panel de "Tus sesiones asignadas" (que ignora estos
    // valores) e vamos directo al panel de confirmar, ya completado.
    setModoManual(irDirectoAConfirmar);
    setTomadas([]);
  }

  // Resumen de todas las sesiones pendientes del docente en el mes, sin
  // importar la edición — para el bloque "Tus sesiones pendientes este mes".
  useEffect(() => {
    if (!docenteEmail) {
      setResumenPendientes([]);
      return;
    }
    if (modoPrueba) {
      setResumenPendientes(DEMO_ASIGNACIONES);
      return;
    }
    setCargandoResumen(true);
    fetch(
      `/api/sesiones-asignadas?email=${encodeURIComponent(
        docenteEmail
      )}&cursoId=ontologico&mes=${encodeURIComponent(mes || "")}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setResumenPendientes(data.asignaciones || []);
      })
      .catch(() => {})
      .finally(() => setCargandoResumen(false));
  }, [docenteEmail, modoPrueba, mes]);

  function handleCargarDesdeResumen(item) {
    const match = ediciones.find(
      (e) =>
        e.cursoReal === "ontologico" &&
        e.modalidad === "sesion" &&
        String(e.edicion) === String(item.edicion)
    );
    if (!match) {
      setErrorResumen(
        `La Edición ${item.edicion} no está abierta para cargar este mes. Escribí a administración para que la habiliten.`
      );
      return;
    }
    setErrorResumen("");
    const unicaSesion = item.sesiones.length === 1 ? item.sesiones[0] : null;
    seleccionarCurso(match.cursoId, item.alumno, unicaSesion, true);
  }

  // Sesiones pre-asignadas (para Ontológico modo sesión), leídas de la planilla externa.
  useEffect(() => {
    if (!esSesion || !docenteEmail) {
      setAsignaciones([]);
      return;
    }
    if (modoPrueba) {
      // En modo prueba no consultamos nada real: mostramos un ejemplo fijo.
      setAsignaciones(DEMO_ASIGNACIONES);
      return;
    }
    setCargandoAsignaciones(true);
    fetch(
      `/api/sesiones-asignadas?email=${encodeURIComponent(docenteEmail)}&cursoId=${encodeURIComponent(
        edicionSeleccionada?.cursoReal || ""
      )}&mes=${encodeURIComponent(mes || "")}&edicion=${encodeURIComponent(
        edicionSeleccionada?.edicion || ""
      )}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setAsignaciones(data.asignaciones || []);
      })
      .catch(() => {})
      .finally(() => setCargandoAsignaciones(false));
  }, [esSesion, docenteEmail, cursoId, modoPrueba, mes]);

  // Números ya cargados por otro docente, para deshabilitarlos en los chips
  // y armar la barra de progreso. En modo sesión manual, se filtra por alumno.
  useEffect(() => {
    if (!cursoId || !edicionSeleccionada) return;
    if (esSesion && !modoManual) return; // en ese caso se usa la lista de pre-asignadas
    if (esSesion && modoManual && !alumno.trim()) {
      setTomadas([]);
      return;
    }
    if (modoPrueba) {
      // En modo prueba no hay nada "ya tomado" — arranca siempre vacío.
      setTomadas([]);
      return;
    }
    setCargandoTomadas(true);
    const params = new URLSearchParams({
      cursoId: edicionSeleccionada.cursoReal,
      edicion: edicionSeleccionada.edicion || "",
    });
    if (esSesion) params.set("alumno", alumno.trim());
    fetch(`/api/clases-tomadas?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setTomadas(data.tomadas || []);
      })
      .catch(() => {})
      .finally(() => setCargandoTomadas(false));
  }, [cursoId, edicionSeleccionada, esSesion, modoManual, alumno, modoPrueba]);

  function toggleChip(n) {
    setSelChips((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  }

  function handleAgregarChips() {
    if (!cursoId || selChips.length === 0) return;
    if (esSesion && !alumno.trim()) return;
    selChips.forEach((n) => {
      onAgregar({
        cursoId,
        cursoReal: edicionSeleccionada.cursoReal,
        nombreCurso: edicionSeleccionada.nombreCurso,
        edicion: edicionSeleccionada?.edicion || "",
        modalidad: edicionSeleccionada?.modalidad || "",
        claseOSesion: String(n),
        alumno: esSesion ? alumno.trim() : "",
      });
    });
    setTomadas((prev) => [...prev, ...selChips.map(String)]);
    if (esSesion) {
      const alumnoNorm = alumno.trim().toLowerCase();
      setResumenPendientes((prev) =>
        prev
          .map((a) =>
            a.alumno.toLowerCase() === alumnoNorm &&
            String(a.edicion) === String(edicionSeleccionada?.edicion)
              ? { ...a, sesiones: a.sesiones.filter((s) => !selChips.includes(s)) }
              : a
          )
          .filter((a) => a.sesiones.length > 0)
      );
    }
    setSelChips([]);
    if (esSesion) setAlumno("");
  }

  function handleAgregarAsignacion() {
    if (!asignacionElegida) return;
    onAgregar({
      cursoId,
      cursoReal: edicionSeleccionada.cursoReal,
      nombreCurso: edicionSeleccionada.nombreCurso,
      edicion: edicionSeleccionada?.edicion || "",
      modalidad: edicionSeleccionada?.modalidad || "",
      claseOSesion: selChips[0],
      alumno: alumno.trim(),
    });
    setAsignaciones((prev) =>
      prev
        .map((a) =>
          a === asignacionElegida
            ? { ...a, sesiones: a.sesiones.filter((s) => s !== selChips[0]) }
            : a
        )
        .filter((a) => a.sesiones.length > 0)
    );
    const alumnoNorm = alumno.trim().toLowerCase();
    setResumenPendientes((prev) =>
      prev
        .map((a) =>
          a.alumno.toLowerCase() === alumnoNorm &&
          String(a.edicion) === String(edicionSeleccionada?.edicion)
            ? { ...a, sesiones: a.sesiones.filter((s) => s !== selChips[0]) }
            : a
        )
        .filter((a) => a.sesiones.length > 0)
    );
    setAsignacionElegida(null);
    setSelChips([]);
    setAlumno("");
  }

  const totalRango = tope;
  const cargadasCount = tomadas.length;
  const pct = totalRango > 0 ? Math.round((cargadasCount / totalRango) * 100) : 0;
  const disponibles = Array.from({ length: tope }, (_, i) => i + 1).filter(
    (n) => !tomadas.includes(String(n))
  );

  const mostrarPreAsignadas = esSesion && !modoManual;
  const mostrarChips = !esSesion || modoManual;

  return (
    <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-5 mb-5">
      <h3 className="font-display text-[17px] text-[var(--teal-900)] mb-3.5">
        Agregar clase o sesión
      </h3>
      {resumenPendientes.length > 0 && (
        <div className="border border-[var(--teal-500)]/40 bg-white rounded-xl p-3.5 mb-4">
          <p className="text-[11px] uppercase tracking-wide text-[var(--teal-700)] font-semibold mb-2">
            Tus sesiones pendientes este mes
          </p>
          <div className="space-y-1.5">
            {resumenPendientes.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 py-2 border-b border-[var(--line)] last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--teal-900)]">{item.alumno}</p>
                  <p className="text-xs text-[var(--ink)]/55">
                    Ontológico · Edición {item.edicion} ·{" "}
                    {item.sesiones.length > 1
                      ? `${item.sesiones.length} sesiones`
                      : `Sesión ${item.sesiones[0]}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCargarDesdeResumen(item)}
                  className="text-xs border border-[var(--line)] rounded-full px-3 py-1.5 font-medium hover:border-[var(--teal-500)] whitespace-nowrap"
                >
                  Cargar
                </button>
              </div>
            ))}
          </div>
          {errorResumen && (
            <p className="text-xs text-[var(--red-700,#b91c1c)] bg-[var(--red-50,#fef2f2)] rounded-lg px-2.5 py-2 mt-2">
              {errorResumen}
            </p>
          )}
        </div>
      )}
      {cargandoResumen && resumenPendientes.length === 0 && (
        <p className="text-xs text-[var(--ink)]/50 mb-3">Buscando tus sesiones pendientes...</p>
      )}

      <label className="block text-[11px] uppercase tracking-wide text-[var(--ink)]/55 mb-1.5">
        Curso
      </label>
      <select
        data-tour="selector-curso"
        value={cursoId}
        onChange={(e) => seleccionarCurso(e.target.value)}
        className="w-full border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm mb-3.5 outline-none bg-white focus:border-[var(--teal-500)]"
      >
        <option value="">Elegí un curso...</option>
        {ediciones.map((e) => (
          <option key={e.cursoId} value={e.cursoId}>
            {e.nombreCurso} {e.edicion ? `— Edición ${e.edicion}` : ""}
          </option>
        ))}
      </select>

      {cursoId && (
        <>
          {mostrarPreAsignadas && (
            <div className="mb-4" data-tour="selector-clase">
              <label className="block text-[11px] uppercase tracking-wide text-[var(--ink)]/55 mb-1.5">
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
                      className="border border-[var(--line)] rounded-lg px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--teal-900)]">{a.alumno}</p>
                        <p className="text-xs text-[var(--ink)]/55">
                          {a.edicion ? `Edición ${a.edicion} · ` : ""}
                          {a.sesiones.length} sesión(es) pendiente(s)
                        </p>
                      </div>
                      <select
                        className="border border-[var(--line)] rounded-lg px-2 py-1 text-sm outline-none"
                        value=""
                        onChange={(e) => {
                          const sesion = e.target.value;
                          if (!sesion) return;
                          setAlumno(a.alumno);
                          setSelChips([sesion]);
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
                className="text-xs text-[var(--teal-700)] underline mt-2"
              >
                No encuentro mi sesión, cargarla a mano
              </button>

              {asignacionElegida && (
                <button
                  onClick={handleAgregarAsignacion}
                  className="w-full mt-3 bg-[var(--amber-600)] text-white rounded-full px-4 py-2 text-sm font-medium"
                >
                  Agregar sesión {selChips[0]} de {alumno} a mi carga
                </button>
              )}
            </div>
          )}

          {mostrarChips && (
            <>
              {esSesion && (
                <>
                  <label className="block text-[11px] uppercase tracking-wide text-[var(--ink)]/55 mb-1.5">
                    ¿De qué alumno es la sesión?
                  </label>
                  <input
                    type="text"
                    value={alumno}
                    onChange={(e) => setAlumno(e.target.value)}
                    placeholder="Nombre y apellido del alumno"
                    className="w-full border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm mb-3.5 outline-none focus:border-[var(--teal-500)]"
                  />
                </>
              )}

              {(!esSesion || alumno.trim()) && (
                <div data-tour="selector-clase">
                  <div className="mb-3.5">
                    <div className="flex justify-between text-[11px] text-[var(--ink)]/65 mb-1">
                      <span>
                        {cargandasLabel(cargadasCount, totalRango)}
                      </span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="h-[7px] bg-[var(--line)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--teal-500)] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <label className="block text-[11px] uppercase tracking-wide text-[var(--ink)]/55 mb-1.5">
                    {esSesion ? "¿Qué sesiones diste?" : "¿Qué clases diste?"}
                  </label>
                  {cargandoTomadas ? (
                    <p className="text-xs text-[var(--ink)]/50">Buscando disponibilidad...</p>
                  ) : disponibles.length === 0 ? (
                    <p className="text-sm text-[var(--clay-600)]">
                      Ya no quedan {esSesion ? "sesiones" : "clases"} por cargar acá.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {disponibles.map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => toggleChip(String(n))}
                          className={`font-mono text-sm rounded-lg px-3 py-1.5 border transition-colors ${
                            selChips.includes(String(n))
                              ? "bg-[var(--teal-700)] border-[var(--teal-700)] text-white"
                              : "bg-white border-[var(--line)] text-[var(--ink)] hover:border-[var(--teal-500)]"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selChips.length > 0 && (!esSesion || alumno.trim()) && (
                <button
                  data-tour="boton-agregar"
                  onClick={handleAgregarChips}
                  className="w-full mt-3.5 bg-[var(--amber-600)] text-white rounded-full px-4 py-2.5 text-sm font-medium"
                >
                  Agregar {selChips.length} {esSesion ? "sesión(es)" : "clase(s)"} a mi carga
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function cargandasLabel(cargadasCount, totalRango) {
  return `${cargadasCount} de ${totalRango} cargadas en esta edición`;
}
