"use client";

import { useEffect, useState } from "react";
import { colorDeCurso } from "@/lib/config";
import { haceCuanto } from "@/lib/tiempo";
import { useEscape } from "@/lib/useEscape";
import DialogoConfirmar from "./DialogoConfirmar";

const plata = (n) => "$" + (n || 0).toLocaleString("es-AR");

// "Ya cargado este mes": todo lo registrado en la hoja "Cargas" (no solo lo pendiente de confirmar
// en esta sesión), agrupado por curso y edición con el subtotal de cada grupo.
//
// onDuplicar(item): pide al padre precargar el selector con el mismo curso/alumno de esa fila.
// onRegistrarPrimera(): pide al padre llevar el foco al selector de curso.
//
// Presentación nueva en 1.7.0 (grupos, menú ⋮, diálogo propio en lugar de confirm/alert del
// navegador). La lógica de lectura, edición y borrado es la misma de antes.
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
  const [menuFila, setMenuFila] = useState(null); // fila con el menú ⋮ abierto
  const [confirmando, setConfirmando] = useState(null); // fila pendiente de confirmar borrado
  const [errorAccion, setErrorAccion] = useState(""); // error de un borrado (antes era un alert)

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

  // El menú ⋮ se cierra con un clic afuera o con Esc.
  useEffect(() => {
    if (menuFila === null) return undefined;
    function cerrar(e) {
      if (!e.target.closest("[data-menu-fila]")) setMenuFila(null);
    }
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, [menuFila]);
  useEscape(menuFila !== null, () => setMenuFila(null));

  const totalClases = cargas.length;
  const cursosDistintos = new Set(cargas.map((c) => c.cursoReal)).size;
  const totalAcumulado = cargas.reduce((acc, c) => acc + (c.valor || 0), 0);
  const cargadas = cargas.filter((c) => c.estadoFacturado?.toLowerCase() === "facturado").length;
  const pendientesFacturar = totalClases - cargadas;

  const filtradas = cargas
    .filter((c) => c.cursoNombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .sort((a, b) => {
      const cmp = a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;
      return ordenDesc ? -cmp : cmp;
    });

  // Grupos por curso + edición, en el orden en que aparece su primera fila.
  const mapaGrupos = new Map();
  filtradas.forEach((c) => {
    const clave = `${c.cursoNombre}||${c.edicion}`;
    if (!mapaGrupos.has(clave)) {
      mapaGrupos.set(clave, { clave, cursoNombre: c.cursoNombre, edicion: c.edicion, cursoReal: c.cursoReal, items: [] });
    }
    mapaGrupos.get(clave).items.push(c);
  });
  const grupos = [...mapaGrupos.values()].map((g) => ({
    ...g,
    subtotal: g.items.reduce((acc, c) => acc + (c.valor || 0), 0),
  }));

  function iniciarEdicion(item) {
    setMenuFila(null);
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

  // Antes: window.confirm + alert. Ahora: diálogo de la app y error dentro de la tarjeta.
  function pedirEliminar(item) {
    setMenuFila(null);
    setErrorAccion("");
    setConfirmando(item);
  }

  async function ejecutarEliminar() {
    const item = confirmando;
    if (!item) return;
    setAccionEnCurso(item.fila);
    try {
      const res = await fetch("/api/mis-cargas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: docenteEmail, fila: item.fila }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrorAccion(data.error || "No se pudo eliminar la carga.");
        return;
      }
      setCargas((prev) => prev.filter((c) => c.fila !== item.fila));
    } catch {
      setErrorAccion("No se pudo eliminar la carga. Probá de nuevo.");
    } finally {
      setAccionEnCurso(null);
      setConfirmando(null);
    }
  }

  if (modoPrueba) {
    return (
      <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-5 mb-5 text-sm text-muted">
        En modo prueba no se muestra el historial real de cargas (no se lee ni se escribe nada en
        la planilla).
      </div>
    );
  }

  return (
    <div className="mb-5">
      {confirmando && (
        <DialogoConfirmar
          titulo="¿Eliminar esta carga?"
          textoConfirmar={accionEnCurso === confirmando.fila ? "Eliminando..." : "Eliminar"}
          peligro
          cargando={accionEnCurso === confirmando.fila}
          onConfirmar={ejecutarEliminar}
          onCancelar={() => setConfirmando(null)}
        >
          <p className="font-semibold text-[var(--ink)] mb-1">
            {confirmando.cursoNombre} — Edición {confirmando.edicion}
            {confirmando.alumno ? ` — ${confirmando.alumno}` : ""} — N° {confirmando.claseOSesion}
          </p>
          <p>Esto libera el número para que se pueda volver a cargar.</p>
        </DialogoConfirmar>
      )}

      {error && <p className="text-[13px] text-[var(--clay-600)] mb-2.5">{error}</p>}

      {cargando && cargas.length === 0 && (
        <p className="text-xs text-muted mb-3">Buscando tu carga de este mes...</p>
      )}

      {!cargando && totalClases === 0 && !error && (
        <div className="border border-dashed border-[var(--line)] rounded-2xl p-6 text-center">
          <p className="text-sm text-muted mb-3">
            Todavía no cargaste ninguna clase ni sesión este mes.
          </p>
          {onRegistrarPrimera && (
            <button
              type="button"
              onClick={onRegistrarPrimera}
              className="bg-primary hover:bg-primaryHover text-white rounded-full px-4 py-2 text-sm font-medium"
            >
              Registrar primera clase
            </button>
          )}
        </div>
      )}

      {totalClases > 0 && (
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 pb-3">
            <div>
              <h2 className="font-display text-[17px] text-[var(--teal-900)] leading-tight">
                Ya cargado{mes ? ` en ${mes}` : ""}
              </h2>
              <p className="text-[13px] text-muted mt-0.5">
                {totalClases} {totalClases === 1 ? "clase o sesión" : "clases o sesiones"} · {cursosDistintos}{" "}
                {cursosDistintos === 1 ? "curso" : "cursos"} · {plata(totalAcumulado)}
              </p>
            </div>
            <div className="flex gap-1.5 text-[12.5px]">
              <span className="bg-teal500/10 text-[var(--teal-700)] rounded-full px-2.5 py-1 font-medium">
                {cargadas} facturada{cargadas === 1 ? "" : "s"}
              </span>
              <span className="bg-[var(--amber-100)] text-[var(--amber-600)] rounded-full px-2.5 py-1 font-medium">
                {pendientesFacturar} sin facturar
              </span>
            </div>
          </div>

          {errorAccion && (
            <div
              role="alert"
              className="mx-4 mb-3 flex items-start justify-between gap-2 rounded-xl border border-clay600/30 bg-clay600/10 px-3 py-2 text-[13px] text-[var(--clay-600)]"
            >
              <span>{errorAccion}</span>
              <button
                type="button"
                onClick={() => setErrorAccion("")}
                aria-label="Cerrar aviso"
                className="shrink-0 font-semibold"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 pb-3">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por curso..."
              aria-label="Buscar por curso"
              className="flex-1 min-w-0 border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--teal-500)]"
            />
            <button
              type="button"
              onClick={() => setOrdenDesc((v) => !v)}
              className="shrink-0 border border-[var(--line)] rounded-lg px-2.5 py-2 text-[13px] font-medium whitespace-nowrap hover:bg-[var(--clay-100)]"
              title="Ordenar por fecha"
            >
              Fecha {ordenDesc ? "↓" : "↑"}
            </button>
          </div>

          <div>
            {grupos.map((g) => (
              <div key={g.clave}>
                <div className="flex items-baseline justify-between gap-3 px-4 py-2 bg-[var(--clay-100)] border-y border-[var(--line)]">
                  <p className="text-[13.5px] font-semibold text-[var(--teal-900)] flex items-start sm:items-center gap-2 min-w-0 leading-snug">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-1 sm:mt-0"
                      style={{ background: colorDeCurso(g.cursoReal) }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 sm:truncate">
                      {g.cursoNombre} · Edición {g.edicion}
                    </span>
                    <span className="font-normal text-muted shrink-0">· {g.items.length}</span>
                  </p>
                  <p className="font-mono text-[13.5px] font-semibold text-[var(--teal-900)] shrink-0">
                    {plata(g.subtotal)}
                  </p>
                </div>

                {g.items.map((item) => {
                  const editando = filaEditando === item.fila;
                  const facturada = item.estadoFacturado?.toLowerCase() === "facturado";
                  const destacada = filaDestacada === item.fila;
                  return (
                    <div
                      key={item.fila}
                      className={`px-4 py-2.5 border-b border-[var(--line)] last:border-b-0 transition-colors ${
                        destacada ? "bg-teal500/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          {editando ? (
                            <div className="flex gap-2">
                              {item.alumno && (
                                <input
                                  type="text"
                                  value={formEdicion.alumno}
                                  onChange={(e) =>
                                    setFormEdicion((f) => ({ ...f, alumno: e.target.value }))
                                  }
                                  className="flex-1 min-w-0 border border-[var(--line)] rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-[var(--teal-500)]"
                                  placeholder="Alumno"
                                  aria-label="Alumno"
                                />
                              )}
                              <input
                                type="text"
                                value={formEdicion.claseOSesion}
                                onChange={(e) =>
                                  setFormEdicion((f) => ({ ...f, claseOSesion: e.target.value }))
                                }
                                className="w-16 border border-[var(--line)] rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-[var(--teal-500)]"
                                placeholder="N°"
                                aria-label="Número de clase o sesión"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="text-[14.5px] font-semibold text-[var(--teal-900)] leading-tight">
                                {item.alumno ? `${item.alumno} · ` : ""}N° {item.claseOSesion}
                              </p>
                              <p className="text-[12.5px] text-muted mt-0.5">
                                {haceCuanto(item.timestamp)}
                                {facturada ? " · Ya facturada: no se puede editar ni eliminar" : ""}
                              </p>
                            </>
                          )}
                          {avisoFila && editando && (
                            <p className="text-[12.5px] text-[var(--clay-600)] mt-1">{avisoFila}</p>
                          )}
                        </div>

                        {!editando && (
                          <>
                            <span
                              className={`shrink-0 hidden sm:inline-block text-[12px] uppercase font-semibold rounded-full px-2 py-1 ${
                                facturada
                                  ? "bg-teal500/10 text-[var(--teal-700)]"
                                  : "bg-[var(--amber-100)] text-[var(--amber-600)]"
                              }`}
                            >
                              {facturada ? "Facturada" : "Pendiente"}
                            </span>
                            <span className="shrink-0 font-mono text-[14px] font-semibold text-[var(--teal-900)]">
                              {plata(item.valor)}
                            </span>
                          </>
                        )}

                        {editando ? (
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => guardarEdicion(item)}
                              disabled={accionEnCurso === item.fila}
                              className="text-[13px] bg-primary hover:bg-primaryHover text-white rounded-full px-3 py-1.5 font-medium disabled:opacity-60"
                            >
                              {accionEnCurso === item.fila ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setFilaEditando(null)}
                              className="text-[13px] border border-[var(--line)] rounded-full px-3 py-1.5 font-medium"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          !facturada && (
                            <div className="relative shrink-0" data-menu-fila>
                              <button
                                type="button"
                                onClick={() => setMenuFila((v) => (v === item.fila ? null : item.fila))}
                                aria-haspopup="menu"
                                aria-expanded={menuFila === item.fila}
                                aria-label={`Más acciones: N° ${item.claseOSesion}`}
                                className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-ink2 hover:bg-[var(--clay-100)]"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                  <circle cx="12" cy="5" r="1.6" />
                                  <circle cx="12" cy="12" r="1.6" />
                                  <circle cx="12" cy="19" r="1.6" />
                                </svg>
                              </button>
                              {menuFila === item.fila && (
                                <div
                                  role="menu"
                                  className="absolute right-0 top-full mt-1 z-30 min-w-[180px] rounded-xl border border-[var(--line)] bg-[var(--panel)] shadow-xl p-1.5"
                                >
                                  {onDuplicar && (
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setMenuFila(null);
                                        onDuplicar(item);
                                      }}
                                      className="w-full text-left h-10 px-3 rounded-lg text-sm font-medium text-[var(--ink)] hover:bg-[var(--clay-100)]"
                                    >
                                      Duplicar
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => iniciarEdicion(item)}
                                    className="w-full text-left h-10 px-3 rounded-lg text-sm font-medium text-[var(--ink)] hover:bg-[var(--clay-100)]"
                                  >
                                    Editar
                                  </button>
                                  <div className="my-1 border-t border-[var(--line)]" />
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => pedirEliminar(item)}
                                    disabled={accionEnCurso === item.fila}
                                    className="w-full text-left h-10 px-3 rounded-lg text-sm font-medium text-[var(--clay-600)] hover:bg-clay600/10 disabled:opacity-60"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {filtradas.length === 0 && (
              <p className="text-sm text-muted text-center py-4">
                Ningún curso coincide con "{busqueda}".
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
