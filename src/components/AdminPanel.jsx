"use client";

import { useEffect, useState } from "react";

function formatearFecha(iso) {
  if (!iso) return "—";
  // Fechas tipo "2026-07-17" (input date) o timestamp ISO completo
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
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-semibold text-[var(--ink)]">Facturas recibidas</h1>
        <button
          onClick={exportarExcel}
          disabled={facturas.length === 0}
          className="bg-[var(--amber-600)] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Exportar a Excel
        </button>
      </div>
      <p className="text-sm text-[var(--ink)]/55 mb-5">
        Se actualiza automáticamente cada vez que un docente sube su factura.
      </p>

      {cargando && <p className="text-sm text-[var(--ink)]/50">Cargando...</p>}
      {error && <p className="text-sm text-[var(--clay-600)]">{error}</p>}

      {!cargando && !error && facturas.length === 0 && (
        <p className="text-sm text-[var(--ink)]/50">Todavía no se subió ninguna factura.</p>
      )}

      {facturas.length > 0 && (
        <div className="overflow-x-auto border border-[var(--clay-300)] rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--clay-100)] text-left">
                <th className="px-4 py-2.5 font-medium text-[var(--ink)]/70">Docente</th>
                <th className="px-4 py-2.5 font-medium text-[var(--ink)]/70">Fecha de factura</th>
                <th className="px-4 py-2.5 font-medium text-[var(--ink)]/70">Fecha de envío</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f, idx) => (
                <tr key={idx} className="border-t border-[var(--clay-300)]">
                  <td className="px-4 py-2.5">{f.nombreDocente || f.email}</td>
                  <td className="px-4 py-2.5">{formatearFecha(f.fechaFactura)}</td>
                  <td className="px-4 py-2.5">{formatearFecha(f.fechaEnvio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
