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

  const { habilitado, cerrado, diasRestantes, diasParaAbrir, mesLabel } = getEstadoCierre();

  if (cerrado) {
    return (
      <div className="rounded-xl bg-[#fdecec] border border-[#f0b8b8] px-4 py-3 mb-4">
        <p className="text-sm text-[var(--clay-600)] font-medium">
          No hay ninguna carga abierta ahora. Se habilita de nuevo el día 1 de {mesLabel}
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
        <span className="bg-[var(--amber-600)] text-white rounded-full px-3 py-1 text-sm font-bold">
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
  const [valores, setValores] = useState({}); // cursoId -> valor
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorEnvio, setErrorEnvio] = useState("");

  const modoPrueba =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("prueba");

  useEffect(() => {
    if (!docente || docente.esAdmin) return;
    const yaVioTutorial = localStorage.getItem(`ilce_tutorial_${docente.email}`);
    if (!yaVioTutorial) setMostrarTutorial(true);
    fetch("/api/valor?soloEdiciones=1")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setEdiciones(data.ediciones);
      })
      .catch(() => {});
  }, [docente]);

  function cerrarTutorial() {
    if (docente) localStorage.setItem(`ilce_tutorial_${docente.email}`, "1");
    setMostrarTutorial(false);
  }

  function agregarItem(item) {
    setPendientes((prev) => [...prev, item]);
    if (docente && !(item.cursoId in valores)) {
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
      setResultado("ok");
      setTab("factura");
    } catch (err) {
      setErrorEnvio("Hubo un problema de conexión. Probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (!docente) {
    return <EmailGate onIngreso={setDocente} />;
  }

  if (docente.esAdmin) {
    return <AdminPanel email={docente.email} />;
  }

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      {mostrarTutorial && <Tutorial onCerrar={cerrarTutorial} />}
      {mostrarRecorrido && <RecorridoGuiado onCerrar={() => setMostrarRecorrido(false)} />}

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-lg font-semibold text-[var(--ink)]">Hola, {docente.nombre || docente.email}</h1>
        <span className="text-[10px] text-[var(--ink)]/30 font-mono">{APP_VERSION}</span>
      </div>

      <button
        onClick={() => setMostrarRecorrido(true)}
        className="text-xs text-[var(--amber-600)] underline mb-3"
      >
        Ver recorrido guiado
      </button>

      <BannerCierre modoPrueba={modoPrueba} />

      <div
        data-tour="tabs"
        className="flex gap-1.5 mb-4 rounded-full p-1 bg-[var(--clay-100)]"
      >
        <button
          onClick={() => setTab("cargar")}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${
            tab === "cargar" ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--ink)]/60"
          }`}
        >
          Cargar clases
        </button>
        <button
          onClick={() => setTab("factura")}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${
            tab === "factura" ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--ink)]/60"
          }`}
        >
          Subir factura
        </button>
      </div>

      {tab === "cargar" && (
        <>
          <SelectorClase ediciones={ediciones} onAgregar={agregarItem} docenteEmail={docente.email} />

          {pendientes.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-medium text-[var(--ink)]/60 mb-2">
                Clases y sesiones agregadas
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
              <div className="flex items-center justify-between px-1 mt-2">
                <span className="text-sm font-medium text-[var(--ink)]/70">Total estimado</span>
                <span className="text-sm font-semibold text-[var(--ink)]">
                  ${total.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          )}

          {errorEnvio && <p className="text-sm text-[var(--clay-600)] mb-2">{errorEnvio}</p>}

          <button
            onClick={confirmarCarga}
            disabled={pendientes.length === 0 || enviando}
            className="w-full bg-[var(--ink)] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            {enviando ? "Enviando..." : "Confirmar carga y continuar"}
          </button>
        </>
      )}

      {tab === "factura" && (
        <SubirFactura
          docente={docente}
          total={total}
          onFinalizar={() => setResultado("factura-ok")}
        />
      )}

      {resultado === "factura-ok" && (
        <p className="text-sm text-[var(--amber-600)] font-medium mt-4 text-center">
          ¡Listo! Tu carga y tu factura quedaron registradas.
        </p>
      )}
    </div>
  );
}
