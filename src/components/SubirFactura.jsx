"use client";

import { useState } from "react";

export default function SubirFactura({ docente, total, onFinalizar }) {
  const [archivo, setArchivo] = useState(null);
  const [fechaFactura, setFechaFactura] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function handleSubir() {
    if (!archivo || !fechaFactura) return;
    setSubiendo(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("factura", archivo);
      formData.append("email", docente.email);
      formData.append("fechaFactura", fechaFactura);
      const res = await fetch("/api/factura", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "No se pudo subir la factura.");
        return;
      }
      onFinalizar();
    } catch (err) {
      setError("Hubo un problema subiendo el archivo. Probá de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="mt-6 border-t border-[var(--clay-300)] pt-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[var(--amber-600)] animate-pulse" />
        <h3 className="text-sm font-semibold text-[var(--ink)]">Cómo armar tu factura</h3>
      </div>
      <ul className="text-sm text-[var(--ink)]/70 space-y-1.5 mb-4 list-disc list-inside">
        <li>
          Monto total del período:{" "}
          <span className="font-semibold text-[var(--ink)]">
            ${total.toLocaleString("es-AR")}
          </span>
        </li>
        <li>Detallá cada clase/sesión cargada como un ítem, o un ítem único con el total.</li>
        <li>Emitila a nombre de Instituto ILCE.</li>
      </ul>

      <label className="block text-xs font-medium text-[var(--ink)]/60 mb-1.5">
        Fecha de la factura
      </label>
      <input
        type="date"
        value={fechaFactura}
        onChange={(e) => setFechaFactura(e.target.value)}
        className="border border-[var(--clay-300)] rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[var(--amber-600)]"
      />

      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => setArchivo(e.target.files?.[0] || null)}
        className="text-sm mb-3"
      />
      {error && <p className="text-sm text-[var(--clay-600)] mb-2">{error}</p>}
      <button
        onClick={handleSubir}
        disabled={!archivo || !fechaFactura || subiendo}
        className="w-full bg-[var(--amber-600)] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {subiendo ? "Subiendo..." : "Subir factura"}
      </button>
    </div>
  );
}
