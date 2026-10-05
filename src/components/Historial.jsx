"use client";

import { useEffect, useMemo, useState } from "react";
import { useEscape } from "@/lib/useEscape";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// "septiembre 2026" -> índice para poder ordenar bien de más reciente a más viejo
// (alfabéticamente "agosto" quedaría antes que "septiembre" y rompería el orden).
function indiceDeMes(mesTexto) {
  const partes = (mesTexto || "").trim().split(" ");
  const nombre = partes[0] || "";
  const anio = parseInt(partes[1], 10) || 0;
  const idxMes = MESES.indexOf(nombre.toLowerCase());
  return anio * 12 + (idxMes === -1 ? 0 : idxMes);
}
function capitalizar(mesTexto) {
  if (!mesTexto) return "";
  return mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);
}
function fechaCorta(timestamp) {
  if (!timestamp) return "";
  const f = new Date(timestamp);
  if (Number.isNaN(f.getTime())) return "";
  const dia = String(f.getDate()).padStart(2, "0");
  const mes = String(f.getMonth() + 1).padStart(2, "0");
  const hora = String(f.getHours()).padStart(2, "0");
  const min = String(f.getMinutes()).padStart(2, "0");
  return `${dia}/${mes} - ${hora}:${min}`;
}
function nombreCurso(c) {
  return (c.cursoNombre || "").replace(/\s*\(sesiones individuales\)\s*/i, "").trim();
}

function GrupoMes({ grupo, abiertoPorDefecto }) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto);
  const cantidad = grupo.cargas.length;
  const total = grupo.cargas.reduce((acc, c) => acc + (c.valor || 0), 0);
  const ultima = grupo.cargas[0]; // ya vienen ordenadas más reciente primero

  return (
    <div className="border border-[var(--line)] rounded-xl mb-2.5 overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-[var(--teal-700)] text-xs">{abierto ? "▼" : ""}</span>
          <span className="font-display text-[15px] text-[var(--teal-900)]">
            {capitalizar(grupo.mes)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">
            {cantidad} clase{cantidad === 1 ? "" : "s"} cargada{cantidad === 1 ? "" : "s"}
          </p>
          <p className="text-sm font-mono font-semibold text-[var(--teal-700)]">
            ${total.toLocaleString("es-AR")}
          </p>
        </div>
      </button>

      {abierto && (
        <div className="border-t border-[var(--line)] px-4 py-3 bg-[var(--panel)]">
          {ultima && (
            <p className="text-[12.5px] text-muted mb-2.5">
              Última carga: {fechaCorta(ultima.timestamp).split(" - ")[0]}
            </p>
          )}
          <div className="space-y-2">
            {grupo.cargas.map((c, i) => (
              <div key={i} className="flex items-start justify-between gap-2 text-sm">
                <div className="flex items-start gap-1.5 min-w-0">
                  <span className="text-[var(--teal-500)] shrink-0"></span>
                  <div className="min-w-0">
                    <p className="text-[var(--teal-900)] font-medium truncate">
                      {nombreCurso(c)}
                      {c.edicion ? ` — Ed. ${c.edicion}` : ""}
                    </p>
                    <p className="text-[12.5px] text-muted">
                      {fechaCorta(c.timestamp)}
                      {c.alumno ? ` · ${c.alumno}` : ""}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-muted shrink-0">
                  ${(c.valor || 0).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Modal de pantalla completa con todo el historial del docente, agrupado por mes
// y colapsado por defecto (solo el mes más reciente arranca abierto).
export default function Historial({ docenteEmail, onCerrar }) {
  useEscape(true, onCerrar);
  const [cargas, setCargas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!docenteEmail) return;
    setCargando(true);
    fetch(`/api/historial?email=${encodeURIComponent(docenteEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setCargas(data.cargas);
        else setError(data.error || "No se pudo cargar el historial.");
      })
      .catch(() => setError("No se pudo conectar con el servidor."))
      .finally(() => setCargando(false));
  }, [docenteEmail]);

  const grupos = useMemo(() => {
    const porMes = {};
    cargas.forEach((c) => {
      const clave = c.mes || "Sin mes";
      if (!porMes[clave]) porMes[clave] = [];
      porMes[clave].push(c);
    });
    return Object.entries(porMes)
      .map(([mes, cargasDelMes]) => ({ mes, cargas: cargasDelMes }))
      .sort((a, b) => indiceDeMes(b.mes) - indiceDeMes(a.mes));
  }, [cargas]);

  const totalGeneral = cargas.reduce((acc, c) => acc + (c.valor || 0), 0);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto px-4 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="bg-[var(--panel)] rounded-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-muted text-lg leading-none"
          aria-label="Cerrar"
        >
          
        </button>
        <h2 className="font-display text-xl text-[var(--teal-900)] mb-1">Historial de envíos</h2>
        <p className="text-xs text-muted mb-4">
          Todas tus cargas, organizadas por mes.
        </p>

        {cargando ? (
          <p className="text-sm text-muted py-6 text-center">Cargando...</p>
        ) : error ? (
          <p className="text-sm text-[var(--clay-600)] py-6 text-center">{error}</p>
        ) : grupos.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">
            Todavía no tenés ninguna carga registrada.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 mb-3 text-xs text-muted">
              <span>Total histórico</span>
              <span className="font-mono font-semibold text-[var(--teal-700)] text-sm">
                ${totalGeneral.toLocaleString("es-AR")}
              </span>
            </div>
            {grupos.map((grupo, i) => (
              <GrupoMes key={grupo.mes} grupo={grupo} abiertoPorDefecto={i === 0} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
