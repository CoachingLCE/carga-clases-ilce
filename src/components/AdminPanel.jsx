"use client";

import { useEffect, useState } from "react";

function formatearFecha(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-AR");
}

export default function AdminPanel({ email }) {
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/facturas?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          setError(data.error || "No se pudo cargar la información.");
          return;
        }
        setFacturas(data.facturas);
      })
      .catch(() => setError("Hubo un problema de conexión."))
      .finally(() => setCargando(false));
  }, [email]);

  async function exportarExcel() {
    const XLSX = await import("xlsx");
    const filas = facturas.map((f) => ({
      Docente: f.nombreDocente || f.email,
      "Fecha de factura": formatearFecha(f.fechaFactura),
      "Fecha de envío": formatearFecha(f.fechaEnvio),
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Facturas");
    XLSX.writeFile(libro, `facturas-ilce-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.jpg"
            alt="Instituto ILCE"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[var(--teal-500)] mb-1">
              Instituto ILCE · Panel de administración
            </p>
            <h1 className="font-display text-2xl text-[var(--teal-900)]">Facturas recibidas</h1>
            <p className="text-[13px] text-[var(--ink)]/55 mt-1.5">
              Se actualiza automáticamente cada vez que un docente sube su factura.
            </p>
          </div>
        </div>
        <button
          onClick={exportarExcel}
          disabled={facturas.length === 0}
          className="bg-[var(--teal-700)] text-white rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap disabled:opacity-40"
        >
          Exportar a Excel
        </button>
      </header>

      {cargando && <p className="text-sm text-[var(--ink)]/50">Cargando...</p>}
      {error && <p className="text-sm text-[var(--clay-600)]">{error}</p>}

      {!cargando && !error && facturas.length === 0 && (
        <p className="text-sm text-[var(--ink)]/50">Todavía no se subió ninguna factura.</p>
      )}

      {facturas.length > 0 && (
        <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#eef0f1] text-left">
                <th className="px-3.5 py-2.5 font-semibold text-[var(--ink)]/70">Docente</th>
                <th className="px-3.5 py-2.5 font-semibold text-[var(--ink)]/70">Fecha de factura</th>
                <th className="px-3.5 py-2.5 font-semibold text-[var(--ink)]/70">Fecha de envío</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f, idx) => (
                <tr key={idx} className="border-t border-[var(--line)]">
                  <td className="px-3.5 py-2.5">{f.nombreDocente || f.email}</td>
                  <td className="px-3.5 py-2.5 font-mono">{formatearFecha(f.fechaFactura)}</td>
                  <td className="px-3.5 py-2.5 font-mono">{formatearFecha(f.fechaEnvio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
