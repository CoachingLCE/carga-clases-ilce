"use client";

import { useState } from "react";
import { CUIT_INSTITUTO, CONDICION_FISCAL } from "@/lib/config";

function agruparParaFactura(items, ediciones, valores) {
  const grupos = {};
  items.forEach((item) => {
    const edicion = ediciones.find((e) => e.cursoId === item.cursoId);
    const nombreCurso = edicion?.nombreCurso || item.cursoId;
    const clave = `${nombreCurso}||${item.edicion}`;
    const valorUnitario = valores[item.cursoId] || 0;
    if (!grupos[clave]) {
      grupos[clave] = { nombreCurso, edicion: item.edicion, cantidad: 0, valorUnitario };
    }
    grupos[clave].cantidad += 1;
  });
  return Object.values(grupos);
}

function GuiaFactura({ items, ediciones, valores }) {
  if (!items || items.length === 0) return null;
  const grupos = agruparParaFactura(items, ediciones, valores);

  return (
    <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="rec-dot w-2 h-2 rounded-full bg-[var(--amber-600)] inline-block" />
        <h3 className="font-display text-[16px] text-[var(--teal-900)]">Cómo armar tu factura</h3>
      </div>
      <div className="flex gap-6 flex-wrap mb-3.5">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--ink)]/55 mb-0.5">
            CUIT Instituto ILCE
          </p>
          <p className="text-sm text-[var(--ink)]">{CUIT_INSTITUTO}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--ink)]/55 mb-0.5">
            Condición
          </p>
          <p className="text-sm text-[var(--ink)]">{CONDICION_FISCAL}</p>
        </div>
      </div>
      {grupos.map((g, i) => (
        <div key={i} className="border border-[var(--line)] rounded-lg px-3 py-2.5 mb-2">
          <p className="text-[11px] uppercase tracking-wide text-[var(--teal-500)] font-semibold mb-1.5">
            Línea {i + 1}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
            <span className="text-[var(--ink)]/55">Producto/Servicio</span>
            <span className="text-[var(--ink)] font-medium">
              {g.nombreCurso} {g.edicion ? `— Edición ${g.edicion}` : ""}
            </span>
            <span className="text-[var(--ink)]/55">Cantidad</span>
            <span className="text-[var(--ink)] font-medium">{g.cantidad}</span>
            <span className="text-[var(--ink)]/55">Precio Unitario</span>
            <span className="text-[var(--ink)] font-medium">
              ${g.valorUnitario.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SubirFactura({ docente, items, ediciones, valores, total, onFinalizar }) {
  const [archivo, setArchivo] = useState(null);
  const [fechaFactura, setFechaFactura] = useState("");
  const [alias, setAlias] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [enviada, setEnviada] = useState(false);

  async function handleSubir() {
    if (!archivo || !fechaFactura) return;
    setSubiendo(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("factura", archivo);
      formData.append("email", docente.email);
      formData.append("fechaFactura", fechaFactura);
      formData.append("alias", alias.trim());
      const res = await fetch("/api/factura", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "No se pudo subir la factura.");
        return;
      }
      setEnviada(true);
      onFinalizar();
    } catch (err) {
      setError("Hubo un problema subiendo el archivo. Probá de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  if (enviada) {
    return (
      <div className="fade-in border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-5 text-center">
        <p className="font-display text-lg text-[var(--teal-900)] mb-1">Factura recibida</p>
        <p className="text-sm text-[var(--ink)]/70">
          Ya quedó registrada con la fecha que indicaste, y va a aparecer en el panel de
          administración.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <GuiaFactura items={items} ediciones={ediciones} valores={valores} />

      <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl p-5">
        <h3 className="font-display text-[17px] text-[var(--teal-900)] mb-1">Subir factura</h3>
        <p className="text-sm text-[var(--ink)]/60 mb-3.5">
          Adjuntá tu factura en PDF, JPG o PNG
          {total ? (
            <>
              {" "}
              por un total de{" "}
              <span className="font-semibold text-[var(--ink)]">
                ${total.toLocaleString("es-AR")}
              </span>
              .
            </>
          ) : (
            "."
          )}
        </p>

        <label className="block text-[11px] uppercase tracking-wide text-[var(--ink)]/55 mb-1.5">
          Fecha de la factura
        </label>
        <input
          type="date"
          value={fechaFactura}
          onChange={(e) => setFechaFactura(e.target.value)}
          className="w-full border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm mb-3.5 outline-none focus:border-[var(--teal-500)]"
        />

        <label className="block text-[11px] uppercase tracking-wide text-[var(--ink)]/55 mb-1.5">
          Alias
        </label>
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="tu.alias.bancario"
          className="w-full border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm mb-3.5 outline-none focus:border-[var(--teal-500)]"
        />

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          className="w-full text-sm mb-3.5"
        />

        {error && <p className="text-[13px] text-[var(--clay-600)] mb-2.5">{error}</p>}

        <button
          onClick={handleSubir}
          disabled={!archivo || !fechaFactura || subiendo}
          className="w-full bg-[var(--teal-700)] text-white rounded-full px-4 py-3 text-sm font-medium disabled:opacity-60"
        >
          {subiendo ? "Subiendo..." : "Subir factura"}
        </button>
      </div>
    </div>
  );
}
