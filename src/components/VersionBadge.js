"use client";
import { useEffect, useState } from "react";
import { APP_VERSION, APP_UPDATED_AT } from "../lib/version";
import { CHANGELOG } from "../lib/changelog";
import { useEscape } from "../lib/useEscape";

// Badge autocontenido (estilos propios) — esta app no usa los tokens de color de las demas.
const CLAVE = "ilce-carga-clases-ultima-version-vista";
const C = { panel: "#161a2e", border: "#2a2f4a", text: "#e7eaf3", sec: "#9aa1c2", muted: "#6b7299", teal: "#22d3ee", purple: "#8b5cf6" };

export default function VersionBadge() {
  const [abierto, setAbierto] = useState(false);
  const [hayNovedades, setHayNovedades] = useState(false);
  const [verAnteriores, setVerAnteriores] = useState(false);
  useEscape(abierto, () => setAbierto(false));
  const fecha = new Date(APP_UPDATED_AT + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

  useEffect(() => { try { if (localStorage.getItem(CLAVE) !== APP_VERSION) setHayNovedades(true); } catch (e) {} }, []);
  function abrir() { setAbierto(true); setHayNovedades(false); try { localStorage.setItem(CLAVE, APP_VERSION); } catch (e) {} }

  const hoy = new Date();
  const mesActual = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0");
  const delMes = CHANGELOG.filter((e) => (e.fecha || "").slice(0, 7) === mesActual);
  const paraMostrar = verAnteriores ? CHANGELOG : (delMes.length ? delMes : CHANGELOG.slice(0, 1));
  const hayMas = !verAnteriores && paraMostrar.length < CHANGELOG.length;

  return (
    <>
      <button onClick={abrir} title="Ver novedades" className={hayNovedades ? "version-badge-novedad" : ""}
        style={{ position: "fixed", bottom: 12, right: 16, fontSize: 11, color: C.muted, background: C.panel, border: "1px solid " + C.border, borderRadius: 999, padding: "4px 12px", zIndex: 40, cursor: "pointer" }}>
        v{APP_VERSION}<span className="hidden sm:inline"> · Actualizado {fecha}</span>
      </button>
      {abierto && (
        <div onClick={() => setAbierto(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: 16, padding: 24, width: "100%", maxWidth: 512, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>📋 Novedades de la app</p>
              <button onClick={() => setAbierto(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {paraMostrar.map((e) => (
                <div key={e.version}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.teal, margin: "0 0 6px" }}>v{e.version} · {new Date(e.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                    {e.cambios.map((c, i) => (<li key={i} style={{ fontSize: 12, color: C.sec, display: "flex", gap: 8 }}><span style={{ color: C.purple }}>•</span><span>{c}</span></li>))}
                  </ul>
                </div>
              ))}
            </div>
            {hayMas && <button onClick={() => setVerAnteriores(true)} style={{ marginTop: 16, fontSize: 12, color: C.teal, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Ver novedades anteriores →</button>}
          </div>
        </div>
      )}
    </>
  );
}
