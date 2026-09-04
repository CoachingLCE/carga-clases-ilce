"use client";

import { useEffect, useState } from "react";
import { colorDeCurso } from "@/lib/config";

// Resumen + tabla de "Tu carga de este mes" (todo lo ya registrado en la
// hoja "Cargas", no solo lo pendiente de confirmar en esta sesión).
//
// onDuplicar(item): pide al padre precargar el selector con el mismo
// curso/alumno de esa fila, para agregar rápido la siguiente sesión/clase.
// onRegistrarPrimera(): pide al padre llevar el foco al selector de curso.
export default function ResumenCargasMes({
  docenteEmail,
  mes,
  modoPrueba,
  refreshSignal,
  onDuplicar,
  onRegistrarPrimera,
}) {
  const [cargas, setCargas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [ordenDesc, setOrdenDesc] = useState(true); // más reciente primero, por defecto
  const [filaEditando, setFilaEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ claseOSesion: "", alumno: "" });
  const [accionEnCurso, setAccionEnCurso] = useState(null); // número de fila en edición/borrado
  const [avisoFila, setAvisoFila] = useState(""); // error puntual de una fila
  const [filaDestacada, setFilaDestacada] = useState(null); // resalta la última agregada

  useEffect(() => {
    if (!docenteEmail || modoPrueba) {
      setCargas([]);
      return;
    }
    setCargando(true);
    setError("");
    fetch(`/api/mis-cargas?email=${encodeURIComponent(docenteEmail)}&mes=${encodeURIComponent(mes || "")}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setCargas((prev) => {
            // Si aparece una fila nueva que antes no estaba, la resaltamos un ratito.
            const filasPrevias = new Set(prev.map((c) => c.fila));
            const nueva = data.cargas.find((c) => !filasPrevias.has(c.fila));
            if (nueva && prev.length > 0) {
              setFilaDestacada(nueva.fila);
              setTimeout(() => setFilaDestacada(null), 2500);
            }
            return data.cargas;
          });
        } else {
          setError(data.error || "No se pudieron traer tus cargas.");
        }
      })
      .catch(() => setError("No se pudieron traer tus cargas."))
      .finally(() => setCargando(false));
  }, [docenteEmail, mes, modoPrueba, refreshSignal]);

  const totalClases = cargas.length;
  const cursosDistintos = new Set(cargas.map((c) => c.cursoNombre)).size;
  const totalAcumulado = cargas.reduce((acc, c) => acc + (c.valor || 0), 0);
  const cargadas = cargas.filter((c) => c.estadoFacturado?.toLowerCase() === "facturado").length;
  const pendientesFacturar = totalClases - cargadas;

  const filtradas = cargas
    .filter((c) => c.cursoNombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .sort((a, b) => {
      const cmp = a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;
      return ordenDesc ? -cmp : cmp;
    });

  function iniciarEdicion(item) {
    setFilaEditando(item.fila);
    setFormEdicion({ claseOSesion: item.claseOSesion, alumno: item.alumno });
    setAvisoFila("");
  }

  async function guardarEdicion(item) {
    setAccionEnCurso(item.fila);
    setAvisoFila("");
    try {
      const res = await fetch("/api/mis-cargas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: docenteEmail,
          fila: item.fila,
          claseOSesion: formEdicion.claseOSesion,
          alumno: formEdicion.alumno,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setAvisoFila(data.error || "No se pudo guardar el cambio.");
        return;
      }
      setCargas((prev) =>
        prev.map((c) =>
          c.fila === item.fila
            ? { ...c, claseOSesion: String(formEdicion.claseOSesion), alumno: formEdicion.alumno }
            : c
        )
      );
      setFilaEditando(null);
    } catch {
      setAvisoFila("No se pudo guardar el cambio. Probá de nuevo.");
    } finally {
      setAccionEnCurso(null);
    }
  }

  async function eliminar(item) {
    const confirmar = window.confirm(
      `¿Eliminar esta carga?\n\n${item.cursoNombre} — Edición ${item.edicion}${
        item.alumno ? ` — ${item.alumno}` : ""
      } — N° ${item.claseOSesion}\n\nEsto libera el número para que se pueda volver a cargar.`
    );
    if (!confirmar) return;

    setAccionEnCurso(item.fila);
    try {
      const res = await fetch("/api/mis-cargas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: docenteEmail, fila: item.fila }),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || "No se pudo eliminar la carga.");
        return;
      }
      setCargas((prev) => prev.filter((c) => c.fila !== item.fila));
    } catch {
      alert("No se pudo eliminar la carga. Probá de nuevo.");
    } finally {
      setAccionEnCurso(null);
    }
  }

  if (modoPrueba) {
    return (
      <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-5 mb-5 text-sm text-[var(--ink)]/60">
        En modo prueba no se muestra el historial real de cargas (no se lee ni se escribe nada en
        la planilla).
      </div>
    );
  }

  return (
    <div className="mb-5">
      {/* Resumen superior */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-xl p-3 text-center">
          <p className="text-xl font-semibold text-[var(--teal-900)] font-mono">{totalClases}</p>
          <p className="text-[11px] text-[var(--ink)]/55 leading-tight mt-0.5">
            clase(s)/sesión(es)
          </p>
        </div>
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-xl p-3 text-center">
          <p className="text-xl font-semibold text-[var(--teal-900)] font-mono">
            {cursosDistintos}
          </p>
          <p className="text-[11px] text-[var(--ink)]/55 leading-tight mt-0.5">curso(s)</p>
        </div>
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-xl p-3 text-center">
          <p className="text-lg font-semibold text-[var(--teal-900)] font-mono">
            ${totalAcumulado.toLocaleString("es-AR")}
          </p>
          <p className="text-[11px] text-[var(--ink)]/55 leading-tight mt-0.5">
            total estimado
          </p>
        </div>
      </div>

      {totalClases > 0 && (
        <div className="flex gap-2 mb-3.5 text-[11px]">
          <span className="bg-[var(--teal-500)]/10 text-[var(--teal-700)] rounded-full px-2.5 py-1 font-medium">
            {cargadas} facturada{cargadas === 1 ? "" : "s"}
          </span>
          <span className="bg-[var(--amber-100)] text-[var(--amber-600)] rounded-full px-2.5 py-1 font-medium">
            {pendientesFacturar} sin facturar
          </span>
        </div>
      )}

      {error && <p className="text-[13px] text-[var(--clay-600)] mb-2.5">{error}</p>}

      {cargando && cargas.length === 0 && (
        <p className="text-xs text-[var(--ink)]/50 mb-3">Buscando tu carga de este mes...</p>
      )}

      {!cargando && totalClases === 0 && !error && (
        <div className="border border-dashed border-[var(--line)] rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--ink)]/60 mb-3">
            Todavía no cargaste ninguna clase ni sesión este mes.
          </p>
          {onRegistrarPrimera && (
            <button
              type="button"
              onClick={onRegistrarPrimera}
              className="bg-[var(--teal-700)] text-white rounded-full px-4 py-2 text-sm font-medium"
            >
              Registrar primera clase
            </button>
          )}
        </div>
      )}

      {totalClases > 0 && (
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por curso..."
              className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--teal-500)]"
            />
            <button
              type="button"
              onClick={() => setOrdenDesc((v) => !v)}
              className="shrink-0 border border-[var(--line)] rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap"
              title="Ordenar por fecha"
            >
              Fecha {ordenDesc ? "↓" : "↑"}
            </button>
          </div>

          <div className="space-y-2">
            {filtradas.map((item) => {
              const editando = filaEditando === item.fila;
              const facturada = item.estadoFacturado?.toLowerCase() === "facturado";
              const destacada = filaDestacada === item.fila;
              return (
                <div
                  key={item.fila}
                  className={`border rounded-xl p-3 transition-colors ${
                    destacada
                      ? "border-[var(--teal-500)] bg-[var(--teal-500)]/5"
                      : "border-[var(--line)]"
                  }`}
                  style={{ borderLeft: `3px solid ${colorDeCurso(item.cursoReal)}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--teal-900)] truncate">
                        {item.cursoNombre} — Edición {item.edicion}
                      </p>
                      {editando ? (
                        <div className="flex gap-2 mt-1.5">
                          {item.alumno && (
                            <input
                              type="text"
                              value={formEdicion.alumno}
                              onChange={(e) =>
                                setFormEdicion((f) => ({ ...f, alumno: e.target.value }))
                              }
                              className="flex-1 border border-[var(--line)] rounded-lg px-2 py-1 text-xs outline-none focus:border-[var(--teal-500)]"
                              placeholder="Alumno"
                            />
                          )}
                          <input
                            type="text"
                            value={formEdicion.claseOSesion}
                            onChange={(e) =>
                              setFormEdicion((f) => ({ ...f, claseOSesion: e.target.value }))
                            }
                            className="w-16 border border-[var(--line)] rounded-lg px-2 py-1 text-xs outline-none focus:border-[var(--teal-500)]"
                            placeholder="N°"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--ink)]/55 mt-0.5">
                          {item.alumno ? `${item.alumno} · ` : ""}N° {item.claseOSesion} · $
                          {(item.valor || 0).toLocaleString("es-AR")}
                        </p>
                      )}
                      {avisoFila && editando && (
                        <p className="text-[11px] text-[var(--clay-600)] mt-1">{avisoFila}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-[10px] uppercase font-semibold rounded-full px-2 py-1 ${
                        facturada
                          ? "bg-[var(--teal-500)]/10 text-[var(--teal-700)]"
                          : "bg-[var(--amber-100)] text-[var(--amber-600)]"
                      }`}
                    >
                      {facturada ? "Facturada" : "Pendiente"}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-2.5">
                    {editando ? (
                      <>
                        <button
                          type="button"
                          onClick={() => guardarEdicion(item)}
                          disabled={accionEnCurso === item.fila}
                          className="text-xs bg-[var(--teal-700)] text-white rounded-full px-3 py-1.5 font-medium disabled:opacity-60"
                        >
                          {accionEnCurso === item.fila ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilaEditando(null)}
                          className="text-xs border border-[var(--line)] rounded-full px-3 py-1.5 font-medium"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : facturada ? (
                      <p className="text-[11px] text-[var(--ink)]/45">
                        Ya facturada — no se puede editar ni eliminar.
                      </p>
                    ) : (
                      <>
                        {onDuplicar && (
                          <button
                            type="button"
                            onClick={() => onDuplicar(item)}
                            className="text-xs border border-[var(--line)] rounded-full px-3 py-1.5 font-medium hover:border-[var(--teal-500)]"
                          >
                            Duplicar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(item)}
                          className="text-xs border border-[var(--line)] rounded-full px-3 py-1.5 font-medium hover:border-[var(--teal-500)]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminar(item)}
                          disabled={accionEnCurso === item.fila}
                          className="text-xs border border-[var(--clay-300)] text-[var(--clay-600)] rounded-full px-3 py-1.5 font-medium disabled:opacity-60"
                        >
                          {accionEnCurso === item.fila ? "Eliminando..." : "Eliminar"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {filtradas.length === 0 && (
              <p className="text-sm text-[var(--ink)]/50 text-center py-4">
                Ningún curso coincide con "{busqueda}".
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
