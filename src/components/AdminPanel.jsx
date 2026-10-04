"use client";

import { useEffect, useState } from "react";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
// "septiembre 2026" -> número comparable (año * 12 + mes). Si no se puede leer, -1.
function ordenDeMes(mes) {
  const [nombre, anio] = String(mes || "").toLowerCase().split(" ");
  const i = MESES.indexOf(nombre);
  const y = parseInt(anio, 10);
  return i < 0 || Number.isNaN(y) ? -1 : y * 12 + i;
}
const capitalizar = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const plata = (n) => "$" + (n || 0).toLocaleString("es-AR");
const iniciales = (n) =>
  String(n || "?").split(" ").filter(Boolean).map((x) => x[0]).slice(0, 2).join("").toUpperCase();

// Presentación nueva en 1.7.0: los mismos datos (docente, mes, cantidad, total, alias, factura),
// con pestañas por mes, indicadores calculados con esas mismas filas, búsqueda y orden.
export default function AdminPanel({ email }) {
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mesSel, setMesSel] = useState(null); // null = el mes más reciente
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ k: null, d: 1 });

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
      Mes: f.mes,
      Cantidad: f.cantidad,
      Total: f.total,
      Alias: f.alias || "",
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Facturas");
    XLSX.writeFile(libro, `facturas-ilce-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const meses = [...new Set(facturas.map((f) => f.mes))].sort((a, b) => ordenDeMes(b) - ordenDeMes(a));
  const mesActivo = mesSel || meses[0] || "todos";
  const delMes = mesActivo === "todos" ? facturas : facturas.filter((f) => f.mes === mesActivo);
  const totalMes = delMes.reduce((acc, f) => acc + (f.total || 0), 0);
  const clasesMes = delMes.reduce((acc, f) => acc + (f.cantidad || 0), 0);

  const q = busqueda.trim().toLowerCase();
  let filas = delMes.filter(
    (f) =>
      !q ||
      (f.nombreDocente || "").toLowerCase().includes(q) ||
      (f.email || "").toLowerCase().includes(q) ||
      (f.alias || "").toLowerCase().includes(q)
  );
  if (orden.k) {
    const valor = {
      n: (f) => (f.nombreDocente || f.email || "").toLowerCase(),
      c: (f) => f.cantidad || 0,
      t: (f) => f.total || 0,
    }[orden.k];
    filas = [...filas].sort((a, b) => (valor(a) > valor(b) ? 1 : valor(a) < valor(b) ? -1 : 0) * orden.d);
  }

  function ordenarPor(k) {
    setOrden((o) => (o.k === k ? { k, d: -o.d } : { k, d: k === "n" ? 1 : -1 }));
  }
  const ariaSort = (k) => (orden.k === k ? (orden.d === 1 ? "ascending" : "descending") : "none");
  const flecha = (k) => (orden.k === k ? (orden.d === 1 ? " ↑" : " ↓") : "");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Instituto ILCE"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="text-[12.5px] uppercase tracking-wide text-[var(--teal-500)] mb-1">
              Instituto ILCE · Panel de administración
            </p>
            <h1 className="font-display text-2xl text-[var(--teal-900)]">Facturas recibidas</h1>
            <p className="text-[13px] text-muted mt-1.5">
              Se actualiza automáticamente cada vez que un docente sube su factura.
            </p>
          </div>
        </div>
        <button
          onClick={exportarExcel}
          disabled={facturas.length === 0}
          className="bg-primary hover:bg-primaryHover text-white rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap disabled:opacity-40"
        >
          Exportar a Excel
        </button>
      </header>

      {cargando && <p className="text-sm text-muted">Cargando...</p>}
      {error && <p className="text-sm text-[var(--clay-600)]">{error}</p>}

      {!cargando && !error && facturas.length === 0 && (
        <p className="text-sm text-muted">Todavía no se subió ninguna factura.</p>
      )}

      {facturas.length > 0 && (
        <>
          <div role="tablist" aria-label="Mes" className="flex gap-1 border-b border-[var(--line)] mb-4 overflow-x-auto">
            {[...meses.map((m) => [m, capitalizar(m), facturas.filter((f) => f.mes === m).length]),
              ...(meses.length > 1 ? [["todos", "Todos", facturas.length]] : [])].map(([clave, etiqueta, n]) => (
              <button
                key={clave}
                role="tab"
                aria-selected={mesActivo === clave}
                onClick={() => setMesSel(clave)}
                className={`h-11 px-4 text-[14.5px] font-semibold border-b-2 -mb-px whitespace-nowrap flex items-center gap-2 transition-colors ${
                  mesActivo === clave
                    ? "border-primary text-primary"
                    : "border-transparent text-ink2 hover:text-[var(--teal-900)]"
                }`}
              >
                {etiqueta}
                <span className="text-[12.5px] rounded-full px-2 leading-5 bg-[var(--clay-100)] text-ink2">{n}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4">
            <Indicador etiqueta="Facturas recibidas" valor={delMes.length} />
            <Indicador etiqueta="Clases y sesiones" valor={clasesMes} />
            <Indicador etiqueta="Total facturado" valor={plata(totalMes)} destacado />
          </div>

          <div className="border border-[var(--line)] bg-[var(--panel)] rounded-2xl overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 p-3 border-b border-[var(--line)]">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por docente o alias"
                aria-label="Buscar por docente o alias"
                className="flex-1 min-w-[180px] border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--teal-500)]"
              />
              <select
                aria-label="Ordenar"
                value={orden.k || ""}
                onChange={(e) => {
                  const k = e.target.value;
                  setOrden(k ? { k, d: k === "n" ? 1 : -1 } : { k: null, d: 1 });
                }}
                className="sm:hidden w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Ordenar por…</option>
                <option value="n">Docente (A–Z)</option>
                <option value="c">Más clases</option>
                <option value="t">Mayor total</option>
              </select>
            </div>

            <div className="max-h-[560px] overflow-auto">
              <table className="tabla-adm w-full text-[14.5px]">
                <thead>
                  <tr className="text-left">
                    <th className="sticky top-0 bg-[var(--paper)] px-4 py-2.5 text-[12.5px] uppercase tracking-wide font-semibold text-muted border-b border-[var(--line)]" aria-sort={ariaSort("n")}>
                      <button type="button" onClick={() => ordenarPor("n")} className="uppercase tracking-wide hover:text-[var(--ink)]">Docente{flecha("n")}</button>
                    </th>
                    <th className="sticky top-0 bg-[var(--paper)] px-4 py-2.5 text-[12.5px] uppercase tracking-wide font-semibold text-muted border-b border-[var(--line)]">Mes</th>
                    <th className="sticky top-0 bg-[var(--paper)] px-4 py-2.5 text-[12.5px] uppercase tracking-wide font-semibold text-muted border-b border-[var(--line)] text-right" aria-sort={ariaSort("c")}>
                      <button type="button" onClick={() => ordenarPor("c")} className="uppercase tracking-wide hover:text-[var(--ink)]">Clases{flecha("c")}</button>
                    </th>
                    <th className="sticky top-0 bg-[var(--paper)] px-4 py-2.5 text-[12.5px] uppercase tracking-wide font-semibold text-muted border-b border-[var(--line)] text-right" aria-sort={ariaSort("t")}>
                      <button type="button" onClick={() => ordenarPor("t")} className="uppercase tracking-wide hover:text-[var(--ink)]">Total{flecha("t")}</button>
                    </th>
                    <th className="sticky top-0 bg-[var(--paper)] px-4 py-2.5 text-[12.5px] uppercase tracking-wide font-semibold text-muted border-b border-[var(--line)] text-right">Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, idx) => (
                    <tr key={idx} className="border-t border-[var(--line)] hover:bg-[var(--clay-100)]">
                      <td className="c-doc px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[12.5px] font-semibold shrink-0 bg-primarySoft text-primarySoftFg"
                            aria-hidden="true"
                          >
                            {iniciales(f.nombreDocente || f.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--teal-900)] leading-tight">
                              {f.nombreDocente || f.email}
                            </p>
                            <p className="text-[13px] text-muted leading-tight mt-0.5 truncate">
                              {f.alias ? `Alias: ${f.alias}` : "Sin alias"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="c-mes px-4 py-3 capitalize whitespace-nowrap">{f.mes}</td>
                      <td className="c-cl px-4 py-3 text-right font-mono font-semibold">{f.cantidad}</td>
                      <td className="c-tot px-4 py-3 text-right font-mono font-semibold text-[var(--teal-900)]">{plata(f.total)}</td>
                      <td className="c-fac px-4 py-3 text-right">
                        {f.archivoUrl ? (
                          <a
                            href={f.archivoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center h-9 px-3.5 rounded-full border border-[var(--line)] text-[13.5px] font-semibold text-[var(--teal-700)] hover:bg-[var(--clay-100)] w-full sm:w-auto"
                          >
                            Ver factura
                          </a>
                        ) : (
                          <span className="inline-block text-[12.5px] font-semibold rounded-full px-2.5 py-1 bg-[var(--clay-100)] text-muted">
                            Sin archivo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                        No hay facturas para esa búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 border-t border-[var(--line)] text-[13.5px] text-ink2">
              <b>{filas.length}</b> {filas.length === 1 ? "factura" : "facturas"} ·{" "}
              <b>{filas.reduce((acc, f) => acc + (f.cantidad || 0), 0)}</b> clases · Total{" "}
              <b className="font-mono">{plata(filas.reduce((acc, f) => acc + (f.total || 0), 0))}</b>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Indicador({ etiqueta, valor, destacado }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--panel)] rounded-xl px-3 sm:px-4 py-3">
      <p className="text-[13px] font-semibold text-ink2 leading-tight">{etiqueta}</p>
      <p
        className={`mt-1 font-mono text-lg sm:text-xl font-semibold leading-tight ${
          destacado ? "text-[var(--teal-700)]" : "text-[var(--teal-900)]"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
