"use client";

import { useEffect, useState } from "react";
import EmailGate from "./EmailGate";
import Tutorial from "./Tutorial";
import RecorridoGuiado from "./RecorridoGuiado";
import SelectorClase from "./SelectorClase";
import TicketClase from "./TicketClase";
import SubirFactura from "./SubirFactura";
import AdminPanel from "./AdminPanel";
import { getEstadoCierre } from "@/lib/mes";
import { DEMO_EDICIONES, DEMO_VALORES } from "@/lib/config";

const APP_VERSION = "v21";

function BannerCierre({ modoPrueba }) {
  if (modoPrueba) {
    return (
      <div className="rounded-full bg-[var(--amber-100)] border border-[var(--amber-600)] px-4 py-1.5 mb-4 text-center">
        <span className="text-xs font-semibold text-[var(--amber-600)]">
          Modo prueba — nada de lo que hagas acá se guarda de verdad
        </span>
      </div>
    );
  }

  const { cerrado, diasRestantes, diasParaAbrir, mesLabel } = getEstadoCierre();

  if (cerrado) {
    return (
      <div className="rounded-xl bg-[#fdecec] border border-[#f0b8b8] px-4 py-3 mb-4">
        <p className="text-sm text-[var(--clay-600)] font-medium">
          No hay ninguna carga abierta ahora. Se habilita de nuevo el último día de {mesLabel}
          {diasParaAbrir ? ` (en ${diasParaAbrir} día${diasParaAbrir === 1 ? "" : "s"})` : ""}.
        </p>
      </div>
    );
  }

  if (diasRestantes === 0) {
    return (
      <div className="rounded-xl bg-[var(--amber-100)] border border-[var(--amber-600)] px-4 py-3 mb-4">
        <p className="text-sm text-[var(--amber-600)] font-semibold">
          Hoy es el último día para cargar tus clases y sesiones de {mesLabel}.
        </p>
      </div>
    );
  }

  if (diasRestantes <= 3) {
    return (
      <div className="rounded-xl bg-[var(--amber-100)] border border-[var(--amber-600)] px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--amber-600)] font-medium">
          En {diasRestantes} día{diasRestantes === 1 ? "" : "s"} se cierra la carga de tus clases y
          sesiones de {mesLabel}.
        </p>
        <span className="font-mono bg-[var(--amber-600)] text-white rounded-full px-3 py-1 text-sm font-bold">
          {diasRestantes}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-1 mb-4">
      <p className="text-xs text-[var(--ink)]/55">
        Podés cargar tus clases y sesiones de {mesLabel} hasta el día 10.
      </p>
      <span className="font-mono text-xs text-[var(--teal-700)] font-semibold">
        {diasRestantes} días
      </span>
    </div>
  );
}

export default function App() {
  const [docente, setDocente] = useState(null);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [mostrarRecorrido, setMostrarRecorrido] = useState(false);
  const [tab, setTab] = useState("cargar"); // cargar | factura
  const [ediciones, setEdiciones] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [confirmados, setConfirmados] = useState([]);
  const [valores, setValores] = useState({}); // cursoId -> valor
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [rechazadosInfo, setRechazadosInfo] = useState(0);

  const modoPruebaUrl =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("prueba");
  const modoPrueba = modoPruebaUrl || !!docente?.modoPrueba;

  useEffect(() => {
    if (!docente || docente.esAdmin) return;
    const yaVioTutorial = localStorage.getItem(`ilce_tutorial_${docente.email}`);
    if (!yaVioTutorial) setMostrarTutorial(true);

    if (modoPrueba) {
      // El modo prueba no lee ni escribe nada en la planilla real.
      setEdiciones(DEMO_EDICIONES);
      return;
    }

    fetch("/api/valor?soloEdiciones=1")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setEdiciones(data.ediciones);
      })
      .catch(() => {});
  }, [docente, modoPrueba]);

  function cerrarTutorial() {
    if (docente) localStorage.setItem(`ilce_tutorial_${docente.email}`, "1");
    setMostrarTutorial(false);
  }

  function agregarItem(item) {
    setPendientes((prev) => [...prev, item]);
    if (item.cursoId in valores) return;
    if (modoPrueba) {
      setValores((prev) => ({ ...prev, [item.cursoId]: DEMO_VALORES[item.cursoId] || 0 }));
      return;
    }
    if (docente) {
      fetch(`/api/valor?email=${encodeURIComponent(docente.email)}&curso=${item.cursoId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) setValores((prev) => ({ ...prev, [item.cursoId]: data.valor }));
        })
        .catch(() => {});
    }
  }

  function quitarItem(idx) {
    setPendientes((prev) => prev.filter((_, i) => i !== idx));
  }

  const total = pendientes.reduce((acc, item) => acc + (valores[item.cursoId] || 0), 0);
  const totalConfirmado = confirmados.reduce((acc, item) => acc + (valores[item.cursoId] || 0), 0);

  async function confirmarCarga() {
    if (pendientes.length === 0) return;
    setEnviando(true);
    setErrorEnvio("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: docente.email,
          modoPrueba,
          items: pendientes.map((p) => ({
            cursoId: p.cursoId,
            edicion: p.edicion,
            claseOSesion: p.claseOSesion,
            alumno: p.alumno,
          })),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrorEnvio(data.error || "No se pudo registrar la carga.");
        return;
      }
      const aceptados = data.aceptados || pendientes;
      setConfirmados((prev) => [...prev, ...aceptados]);
      setRechazadosInfo((data.rechazados || []).length);
      setPendientes([]);
      setResultado("ok");
      setTab("factura");
    } catch (err) {
      setErrorEnvio("Hubo un problema de conexión. Probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (!docente) {
    return (
      <div className="max-w-md mx-auto px-6 py-8">
        <EmailGate onIngreso={setDocente} />
      </div>
    );
  }

  if (docente.esAdmin) {
    return <AdminPanel email={docente.email} />;
  }

  const { mesLabel } = getEstadoCierre();

  return (
    <div className="max-w-md mx-auto px-6 py-8 pb-16">
      {mostrarTutorial && <Tutorial onCerrar={cerrarTutorial} />}
      {mostrarRecorrido && <RecorridoGuiado onCerrar={() => setMostrarRecorrido(false)} />}

      {modoPrueba && (
        <div className="rounded-full bg-[var(--amber-100)] border border-[var(--amber-600)] px-3.5 py-1.5 mb-2 text-center">
          <span className="text-xs font-semibold text-[var(--amber-600)]">
            Modo prueba — nada de lo que hagas acá se guarda de verdad
          </span>
        </div>
      )}

      {modoPrueba && (
        <div className="text-center mb-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.delete("prueba");
                window.history.replaceState({}, "", url.toString());
              }
              setDocente(null);
            }}
            className="text-[11px] text-[var(--ink)]/50 underline"
          >
            Salir del modo prueba
          </button>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Instituto ILCE"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[var(--teal-500)] mb-1">
              Instituto ILCE · {mesLabel}
            </p>
            <h1 className="font-display text-2xl text-[var(--teal-900)]">
              Hola, {docente.nombre || docente.email}
            </h1>
          </div>
        </div>
        <button
          onClick={() => setMostrarRecorrido(true)}
          className="text-[11px] text-[var(--teal-700)] underline mt-1.5 whitespace-nowrap"
        >
          Ver recorrido
        </button>
      </div>

      <button
        onClick={() => setMostrarTutorial(true)}
        className="text-xs text-[var(--amber-600)] underline mb-3.5 block"
      >
        Ver tutorial
      </button>

      <BannerCierre modoPrueba={modoPrueba} />

      <div
        data-tour="tabs"
        className="flex gap-1.5 mb-5 rounded-full p-1"
        style={{ background: "var(--clay-100)" }}
      >
        <button
          onClick={() => setTab("cargar")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            tab === "cargar" ? "bg-white text-[var(--teal-900)] shadow-sm" : "text-[var(--ink)]/60"
          }`}
        >
          Cargar clases
        </button>
        <button
          onClick={() => setTab("factura")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
            tab === "factura" ? "bg-white text-[var(--teal-900)] shadow-sm" : "text-[var(--ink)]/60"
          }`}
        >
          Subir factura
        </button>
      </div>

      <div className="fade-in">
        {tab === "cargar" && (
          <>
            {resultado === "ok" && confirmados.length > 0 && pendientes.length === 0 ? (
              <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-5 text-center">
                <p className="font-display text-xl text-[var(--teal-900)] mb-1">Carga confirmada</p>
                <p className="text-sm text-[var(--ink)]/70 mb-3">
                  Total a facturar:{" "}
                  <span className="font-mono font-semibold text-[var(--teal-700)]">
                    ${totalConfirmado.toLocaleString("es-AR")}
                  </span>
                </p>
                {rechazadosInfo > 0 && (
                  <p className="text-[13px] text-[var(--clay-600)] mb-3">
                    {rechazadosInfo} ítem(s) no se pudieron cargar: ya estaban registrados por otro
                    docente.
                  </p>
                )}
                <button
                  onClick={() => setTab("factura")}
                  className="w-full bg-[var(--amber-600)] text-white rounded-full px-4 py-2.5 text-sm font-medium mb-2"
                >
                  Subir factura ahora
                </button>
                <button
                  onClick={() => setResultado(null)}
                  className="w-full border border-[var(--line)] rounded-full px-4 py-2.5 text-sm font-medium text-[var(--teal-700)]"
                >
                  Agregar más clases
                </button>
              </div>
            ) : (
              <>
                <SelectorClase
                  ediciones={ediciones}
                  onAgregar={agregarItem}
                  docenteEmail={docente.email}
                  modoPrueba={modoPrueba}
                />

                {pendientes.length > 0 && (
                  <div className="mb-4">
                    <h2 className="font-display text-[17px] text-[var(--teal-900)] mb-3">
                      Tu carga de este mes
                    </h2>
                    {pendientes.map((item, idx) => {
                      const edicion = ediciones.find((e) => e.cursoId === item.cursoId);
                      return (
                        <TicketClase
                          key={idx}
                          item={item}
                          nombreCurso={edicion?.nombreCurso || item.cursoId}
                          valor={valores[item.cursoId]}
                          onQuitar={() => quitarItem(idx)}
                        />
                      );
                    })}
                    <div className="flex items-center justify-between px-1 py-2 mb-2">
                      <span className="text-sm text-[var(--ink)]/70">Total estimado</span>
                      <span className="font-mono text-lg font-semibold text-[var(--teal-700)]">
                        ${total.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                )}

                {errorEnvio && <p className="text-[13px] text-[var(--clay-600)] mb-2.5">{errorEnvio}</p>}

                <button
                  onClick={confirmarCarga}
                  disabled={pendientes.length === 0 || enviando}
                  className="w-full bg-[var(--teal-700)] text-white rounded-full px-4 py-3 text-sm font-medium disabled:opacity-40"
                >
                  {enviando ? "Enviando..." : "Confirmar carga"}
                </button>
              </>
            )}
          </>
        )}

        {tab === "factura" && (
          <SubirFactura
            docente={docente}
            items={confirmados}
            ediciones={ediciones}
            valores={valores}
            total={totalConfirmado}
            onFinalizar={() => setResultado("factura-ok")}
          />
        )}
      </div>

      <p className="text-xs text-[var(--ink)]/45 text-center mt-8 leading-relaxed">
        ¿Tenés algún inconveniente con la app?
        <br />
        Escribí a{" "}
        <a href="mailto:administracion@institutoilce.com" className="text-[var(--teal-700)]">
          administracion@institutoilce.com
        </a>
      </p>

      <div className="fixed bottom-2.5 right-3.5 text-[11px] text-[var(--ink)]/35 font-mono z-10">
        {APP_VERSION}
      </div>
    </div>
  );
}
